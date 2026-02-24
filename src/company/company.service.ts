import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateCompanyDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  website?: string;
  currency?: string;
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    // Remove undefined fields
    const updateData: any = {};
    Object.keys(updateCompanyDto).forEach((key) => {
      if (updateCompanyDto[key] !== undefined) {
        updateData[key] = updateCompanyDto[key];
      }
    });

    const updated = await this.prisma.company.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }
}

