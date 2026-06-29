import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactQueryDocument = ContactQuery & Document;

@Schema({ timestamps: true })
export class ContactQuery {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: 'NEW', enum: ['NEW', 'REVIEWED'] })
  status: string;
}

export const ContactQuerySchema = SchemaFactory.createForClass(ContactQuery);
// Add toJSON transform so `id` virtual is exposed
ContactQuerySchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
