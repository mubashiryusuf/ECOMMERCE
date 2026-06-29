import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const productUploadDir = join(process.cwd(), 'uploads', 'products');
const categoryUploadDir = join(process.cwd(), 'uploads', 'categories');
const brandUploadDir = join(process.cwd(), 'uploads', 'brands');

function makeInterceptor(destDir: string) {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        mkdirSync(destDir, { recursive: true });
        cb(null, destDir);
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  });
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/upload')
export class AdminUploadController {
  @Post()
  @UseInterceptors(makeInterceptor(productUploadDir))
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { url: `/uploads/products/${file.filename}` };
  }

  @Post('category')
  @UseInterceptors(makeInterceptor(categoryUploadDir))
  uploadCategoryImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { url: `/uploads/categories/${file.filename}` };
  }

  @Post('brand')
  @UseInterceptors(makeInterceptor(brandUploadDir))
  uploadBrandImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return { url: `/uploads/brands/${file.filename}` };
  }
}
