import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStatusDto, OrderStatus } from './dto/update-status.dto';

/** Valid forward transitions per the spec order lifecycle. */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.order.findMany({
      include: { user: { select: { id: true, email: true, name: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const current = order.status as OrderStatus;
    const allowed = VALID_TRANSITIONS[current];

    if (!allowed.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Invalid status transition from ${current} to ${dto.status}`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { product: true } } },
    });
  }
}
