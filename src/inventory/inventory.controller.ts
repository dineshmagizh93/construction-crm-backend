import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Inventory Items
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  createItem(
    @Body() createItemDto: CreateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createItem(createItemDto, user.companyId);
  }

  @Get('items')
  findAllItems(
    @CurrentUser() user: any,
    @Query('category') category?: string,
  ) {
    return this.inventoryService.findAllItems(user.companyId, category);
  }

  @Get('items/low-stock')
  getLowStockItems(@CurrentUser() user: any) {
    return this.inventoryService.getLowStockItems(user.companyId);
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.findOneItem(id, user.companyId);
  }

  @Patch('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.updateItem(id, updateItemDto, user.companyId);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.removeItem(id, user.companyId);
  }

  // Inventory Transactions
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  createTransaction(
    @Body() createTransactionDto: CreateInventoryTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createTransaction(
      createTransactionDto,
      user.companyId,
    );
  }

  @Get('transactions')
  findAllTransactions(
    @CurrentUser() user: any,
    @Query('itemId') itemId?: string,
  ) {
    return this.inventoryService.findAllTransactions(user.companyId, itemId);
  }

  @Get('transactions/:id')
  findOneTransaction(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.findOneTransaction(id, user.companyId);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTransaction(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.removeTransaction(id, user.companyId);
  }

  // Stats
  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.inventoryService.getStats(user.companyId);
  }
}

