import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto, companyId: string) {
    const data: Prisma.VendorCreateInput = {
      name: createVendorDto.name,
      type: createVendorDto.type,
      contactPerson: createVendorDto.contactPerson,
      phone: createVendorDto.phone,
      email: createVendorDto.email,
      address: createVendorDto.address,
      notes: createVendorDto.notes,
      status: createVendorDto.status || 'Active',
      company: { connect: { id: companyId } },
    };

    return this.prisma.vendor.create({ data });
  }

  async findAll(companyId: string, type?: string) {
    const where: Prisma.VendorWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (type) where.type = type;

    return this.prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.VendorUpdateInput = {};
    if (updateVendorDto.name !== undefined) data.name = updateVendorDto.name;
    if (updateVendorDto.type !== undefined) data.type = updateVendorDto.type;
    if (updateVendorDto.contactPerson !== undefined) data.contactPerson = updateVendorDto.contactPerson;
    if (updateVendorDto.phone !== undefined) data.phone = updateVendorDto.phone;
    if (updateVendorDto.email !== undefined) data.email = updateVendorDto.email;
    if (updateVendorDto.address !== undefined) data.address = updateVendorDto.address;
    if (updateVendorDto.notes !== undefined) data.notes = updateVendorDto.notes;
    if (updateVendorDto.status !== undefined) data.status = updateVendorDto.status;

    return this.prisma.vendor.update({ where: { id }, data });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}

