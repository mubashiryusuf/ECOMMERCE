import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContactQuery,
  ContactQuerySchema,
} from '../mongoose/schemas/contact-query.schema';
import { ContactService } from './contact.service';
import { ContactPublicController, ContactAdminController } from './contact.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactQuery.name, schema: ContactQuerySchema },
    ]),
  ],
  providers: [ContactService],
  controllers: [ContactPublicController, ContactAdminController],
  exports: [ContactService],
})
export class ContactModule {}
