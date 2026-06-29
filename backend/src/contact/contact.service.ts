import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactQuery,
  ContactQueryDocument,
} from '../mongoose/schemas/contact-query.schema';
import { CreateContactQueryDto } from './dto/create-contact-query.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactQuery.name)
    private contactQueryModel: Model<ContactQueryDocument>,
  ) {}

  /** Create a new contact query document and return it. */
  async createQuery(dto: CreateContactQueryDto): Promise<ContactQueryDocument> {
    return this.contactQueryModel.create(dto);
  }

  /** Return all contact queries sorted newest-first. */
  async listQueries(): Promise<ContactQueryDocument[]> {
    return this.contactQueryModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Update the status of a contact query by its Mongo id.
   * Throws NotFoundException if the document does not exist.
   */
  async updateStatus(
    id: string,
    status: string,
  ): Promise<ContactQueryDocument> {
    const updated = await this.contactQueryModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`ContactQuery ${id} not found`);
    }
    return updated;
  }
}
