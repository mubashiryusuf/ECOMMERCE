import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class OrderItem {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPriceCents: number;

  @Prop({ required: true, type: Number })
  lineTotalCents: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.items) {
        ret.items = ret.items.map((item: any) => ({
          ...item,
          id: item._id?.toString(),
          productId: item.productId?.toString(),
          _id: undefined,
        }));
      }
      if (ret.userId) ret.userId = ret.userId.toString();
    },
  },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true, type: Number })
  totalCents: number;

  @Prop({ type: String, default: null })
  paymentRef: string | null;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
