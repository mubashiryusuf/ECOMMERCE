import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@example.com';
  const customerEmail = 'customer@example.com';

  // Idempotent upsert for admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin1234!', 10),
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Idempotent upsert for customer
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      passwordHash: await bcrypt.hash('Customer1234!', 10),
      name: 'Test Customer',
      role: Role.CUSTOMER,
    },
  });

  // Sample products across categories
  const products = [
    { name: 'Wireless Headphones', description: 'Over-ear noise cancelling', priceCents: 9999, imageUrl: 'https://placehold.co/400x400?text=Headphones', category: 'Electronics', stockQuantity: 15 },
    { name: 'Mechanical Keyboard', description: 'Tactile switches, RGB backlight', priceCents: 7499, imageUrl: 'https://placehold.co/400x400?text=Keyboard', category: 'Electronics', stockQuantity: 8 },
    { name: 'Running Shoes', description: 'Lightweight cushioned sole', priceCents: 5999, imageUrl: 'https://placehold.co/400x400?text=Shoes', category: 'Footwear', stockQuantity: 20 },
    { name: 'Canvas Backpack', description: '30L waterproof daypack', priceCents: 3499, imageUrl: 'https://placehold.co/400x400?text=Backpack', category: 'Bags', stockQuantity: 12 },
    { name: 'Coffee Mug Set', description: 'Set of 4 ceramic mugs', priceCents: 1999, imageUrl: 'https://placehold.co/400x400?text=Mugs', category: 'Kitchen', stockQuantity: 30 },
    { name: 'Yoga Mat', description: 'Non-slip 6mm thick', priceCents: 2999, imageUrl: 'https://placehold.co/400x400?text=YogaMat', category: 'Sports', stockQuantity: 0 },
    { name: 'Desk Lamp', description: 'LED adjustable arm lamp', priceCents: 4499, imageUrl: 'https://placehold.co/400x400?text=Lamp', category: 'Home', stockQuantity: 5 },
    { name: 'Novel: The Algorithm', description: 'Tech thriller bestseller', priceCents: 1499, imageUrl: 'https://placehold.co/400x400?text=Book', category: 'Books', stockQuantity: 50 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name }, // use name as temp stable key — will be replaced with proper cuid in real use
      update: {},
      create: p,
    }).catch(async () => {
      // If upsert fails (id not cuid), check by name
      const existing = await prisma.product.findFirst({ where: { name: p.name } });
      if (!existing) await prisma.product.create({ data: p });
    });
  }

  // Ensure customer has a cart
  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  console.log('Seed complete.');
  console.log('Admin:    admin@example.com / Admin1234!');
  console.log('Customer: customer@example.com / Customer1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
