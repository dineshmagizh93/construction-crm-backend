import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Inventory Items
  async createItem(createItemDto: CreateInventoryItemDto, companyId: string) {
    const data: Prisma.InventoryItemCreateInput = {
      name: createItemDto.name,
      description: createItemDto.description,
      category: createItemDto.category,
      unit: createItemDto.unit,
      currentStock: createItemDto.currentStock
        ? new Prisma.Decimal(createItemDto.currentStock)
        : new Prisma.Decimal(0),
      minStock: createItemDto.minStock
        ? new Prisma.Decimal(createItemDto.minStock)
        : new Prisma.Decimal(0),
      unitPrice: createItemDto.unitPrice
        ? new Prisma.Decimal(createItemDto.unitPrice)
        : null,
      vendorId: createItemDto.vendorId,
      location: createItemDto.location,
      sku: createItemDto.sku,
      notes: createItemDto.notes,
      company: {
        connect: { id: companyId },
      },
    };

    return this.prisma.inventoryItem.create({
      data,
    });
  }

  async findAllItems(companyId: string, category?: string) {
    const where: Prisma.InventoryItemWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (category) where.category = category;

    return this.prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOneItem(id: string, companyId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        transactions: {
          take: 10,
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async updateItem(
    id: string,
    updateItemDto: UpdateInventoryItemDto,
    companyId: string,
  ) {
    await this.findOneItem(id, companyId);

    const data: Prisma.InventoryItemUpdateInput = {};
    if (updateItemDto.name !== undefined) data.name = updateItemDto.name;
    if (updateItemDto.description !== undefined)
      data.description = updateItemDto.description;
    if (updateItemDto.category !== undefined)
      data.category = updateItemDto.category;
    if (updateItemDto.unit !== undefined) data.unit = updateItemDto.unit;
    if (updateItemDto.currentStock !== undefined)
      data.currentStock = new Prisma.Decimal(updateItemDto.currentStock);
    if (updateItemDto.minStock !== undefined)
      data.minStock = new Prisma.Decimal(updateItemDto.minStock);
    if (updateItemDto.unitPrice !== undefined)
      data.unitPrice = updateItemDto.unitPrice
        ? new Prisma.Decimal(updateItemDto.unitPrice)
        : null;
    if (updateItemDto.vendorId !== undefined)
      data.vendorId = updateItemDto.vendorId;
    if (updateItemDto.location !== undefined)
      data.location = updateItemDto.location;
    if (updateItemDto.sku !== undefined) data.sku = updateItemDto.sku;
    if (updateItemDto.notes !== undefined) data.notes = updateItemDto.notes;

    return this.prisma.inventoryItem.update({
      where: { id },
      data,
    });
  }

  async removeItem(id: string, companyId: string) {
    await this.findOneItem(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }

  async getLowStockItems(companyId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
    });

    return items.filter((item) => {
      const current = parseFloat(item.currentStock.toString());
      const min = parseFloat(item.minStock.toString());
      return current <= min;
    });
  }

  // Inventory Transactions
  async createTransaction(
    createTransactionDto: CreateInventoryTransactionDto,
    companyId: string,
  ) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: createTransactionDto.itemId, companyId, deletedAt: null },
    });

    if (!item) throw new NotFoundException('Inventory item not found');

    const quantity = new Prisma.Decimal(createTransactionDto.quantity);
    let newStock = new Prisma.Decimal(item.currentStock);

    // Update stock based on transaction type
    if (createTransactionDto.type === 'IN') {
      newStock = new Prisma.Decimal(
        parseFloat(item.currentStock.toString()) +
          parseFloat(quantity.toString()),
      );
    } else if (createTransactionDto.type === 'OUT') {
      const currentStock = parseFloat(item.currentStock.toString());
      const outQuantity = parseFloat(quantity.toString());
      if (currentStock < outQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
      newStock = new Prisma.Decimal(currentStock - outQuantity);
    } else if (createTransactionDto.type === 'ADJUSTMENT') {
      newStock = quantity;
    }

    // Create transaction and update item stock in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.inventoryTransaction.create({
        data: {
          type: createTransactionDto.type,
          quantity,
          projectId: createTransactionDto.projectId,
          reference: createTransactionDto.reference,
          notes: createTransactionDto.notes,
          transactionDate: createTransactionDto.transactionDate
            ? new Date(createTransactionDto.transactionDate)
            : new Date(),
          company: {
            connect: { id: companyId },
          },
          item: {
            connect: { id: createTransactionDto.itemId },
          },
        },
      });

      await tx.inventoryItem.update({
        where: { id: createTransactionDto.itemId },
        data: { currentStock: newStock },
      });

      return transaction;
    });

    return result;
  }

  async findAllTransactions(companyId: string, itemId?: string) {
    const where: Prisma.InventoryTransactionWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (itemId) where.itemId = itemId;

    return this.prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async findOneTransaction(id: string, companyId: string) {
    const transaction = await this.prisma.inventoryTransaction.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    });

    if (!transaction)
      throw new NotFoundException('Inventory transaction not found');
    return transaction;
  }

  async removeTransaction(id: string, companyId: string) {
    const transaction = await this.findOneTransaction(id, companyId);

    // Reverse the stock change
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: transaction.itemId },
    });

    if (!item) throw new NotFoundException('Inventory item not found');

    let newStock = new Prisma.Decimal(item.currentStock);
    const quantity = parseFloat(transaction.quantity.toString());

    if (transaction.type === 'IN') {
      newStock = new Prisma.Decimal(
        parseFloat(item.currentStock.toString()) - quantity,
      );
    } else if (transaction.type === 'OUT') {
      newStock = new Prisma.Decimal(
        parseFloat(item.currentStock.toString()) + quantity,
      );
    } else if (transaction.type === 'ADJUSTMENT') {
      // For adjustments, we can't easily reverse, so we'll just delete
      // In a real system, you might want to keep adjustment history
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.inventoryTransaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      if (transaction.type !== 'ADJUSTMENT') {
        await tx.inventoryItem.update({
          where: { id: transaction.itemId },
          data: { currentStock: newStock },
        });
      }
    });
  }

  async getStats(companyId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
    });

    const lowStockItems = items.filter((item) => {
      const current = parseFloat(item.currentStock.toString());
      const min = parseFloat(item.minStock.toString());
      return current <= min;
    });

    const totalValue = items.reduce((sum, item) => {
      const stock = parseFloat(item.currentStock.toString());
      const price = item.unitPrice
        ? parseFloat(item.unitPrice.toString())
        : 0;
      return sum + stock * price;
    }, 0);

    return {
      totalItems: items.length,
      lowStockCount: lowStockItems.length,
      totalValue,
      categoryCounts: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

