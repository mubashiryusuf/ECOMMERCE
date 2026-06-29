import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Product {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true, type: Number }) priceCents: number;
  @Prop({ required: true }) imageUrl: string;
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ required: true }) category: string;
  @Prop({ required: true, default: 0, type: Number }) stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
