import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactQueryDto } from './dto/create-contact-query.dto';
import { UpdateContactQueryStatusDto } from './dto/update-contact-query-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('contact')
@Controller('contact')
export class ContactPublicController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'Submit a contact query (public)' })
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateContactQueryDto) {
    return this.contactService.createQuery(dto);
  }
}

@ApiTags('admin-contact')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/contact-queries')
export class ContactAdminController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'List all contact queries (admin)' })
  @Get()
  listAll() {
    return this.contactService.listQueries();
  }

  @ApiOperation({ summary: 'Update contact query status (admin)' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactQueryStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto.status);
  }
}
