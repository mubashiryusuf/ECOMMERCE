import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ecommerce';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    priceCents: Number,
    imageUrl: String,
    category: String,
    stockQuantity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const CartItemSchema = new mongoose.Schema({
  productId: mongoose.Types.ObjectId,
  quantity: Number,
});

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

const OrderItemSchema = new mongoose.Schema({
  productId: mongoose.Types.ObjectId,
  quantity: Number,
  unitPriceCents: Number,
  lineTotalCents: Number,
});

const OrderSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    status: { type: String, default: 'PENDING' },
    totalCents: Number,
    paymentRef: String,
    name: String,
    addressLine1: String,
    city: String,
    postalCode: String,
    country: String,
    items: { type: [OrderItemSchema], default: [] },
  },
  { timestamps: true },
);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const UserModel = mongoose.model('User', UserSchema);
  const ProductModel = mongoose.model('Product', ProductSchema);
  const CartModel = mongoose.model('Cart', CartSchema);
  // Register Order model even if not used below — keeps schema in sync
  mongoose.model('Order', OrderSchema);

  // Upsert admin
  const adminHash = await bcrypt.hash('Test123', 10);
  const admin = await UserModel.findOneAndUpdate(
    { email: 'admin@yopmail.com' },
    {
      $setOnInsert: {
        email: 'admin@yopmail.com',
        passwordHash: adminHash,
        name: 'Admin User',
        role: 'ADMIN',
      },
    },
    { upsert: true, new: true },
  );
  console.log(`Admin user: ${admin.email} (${admin._id})`);

  // Upsert customer
  const customerHash = await bcrypt.hash('Customer1234!', 10);
  const customer = await UserModel.findOneAndUpdate(
    { email: 'customer@example.com' },
    {
      $setOnInsert: {
        email: 'customer@example.com',
        passwordHash: customerHash,
        name: 'Test Customer',
        role: 'CUSTOMER',
      },
    },
    { upsert: true, new: true },
  );
  console.log(`Customer user: ${customer.email} (${customer._id})`);

  // Upsert products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'Over-ear noise cancelling',
      priceCents: 9999,
      imageUrl: 'https://placehold.co/400x400?text=Headphones',
      category: 'Electronics',
      stockQuantity: 15,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'Tactile switches, RGB backlight',
      priceCents: 7499,
      imageUrl: 'https://placehold.co/400x400?text=Keyboard',
      category: 'Electronics',
      stockQuantity: 8,
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight cushioned sole',
      priceCents: 5999,
      imageUrl: 'https://placehold.co/400x400?text=Shoes',
      category: 'Footwear',
      stockQuantity: 20,
    },
    {
      name: 'Canvas Backpack',
      description: '30L waterproof daypack',
      priceCents: 3499,
      imageUrl: 'https://placehold.co/400x400?text=Backpack',
      category: 'Bags',
      stockQuantity: 12,
    },
    {
      name: 'Coffee Mug Set',
      description: 'Set of 4 ceramic mugs',
      priceCents: 1999,
      imageUrl: 'https://placehold.co/400x400?text=Mugs',
      category: 'Kitchen',
      stockQuantity: 30,
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip 6mm thick',
      priceCents: 2999,
      imageUrl: 'https://placehold.co/400x400?text=YogaMat',
      category: 'Sports',
      stockQuantity: 0,
    },
    {
      name: 'Desk Lamp',
      description: 'LED adjustable arm lamp',
      priceCents: 4499,
      imageUrl: 'https://placehold.co/400x400?text=Lamp',
      category: 'Home',
      stockQuantity: 5,
    },
    {
      name: 'Novel: The Algorithm',
      description: 'Tech thriller bestseller',
      priceCents: 1499,
      imageUrl: 'https://placehold.co/400x400?text=Book',
      category: 'Books',
      stockQuantity: 50,
    },
  ];

  for (const p of products) {
    await ProductModel.findOneAndUpdate({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  }
  console.log(`Seeded ${products.length} products`);

  // Ensure customer has an empty cart
  await CartModel.findOneAndUpdate(
    { userId: customer._id },
    { $setOnInsert: { userId: customer._id, items: [] } },
    { upsert: true },
  );
  console.log('Cart created for customer');

  console.log('\nSeed complete.');
  console.log('Admin:    admin@yopmail.com / Test123');
  console.log('Customer: customer@example.com / Customer1234!');

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
