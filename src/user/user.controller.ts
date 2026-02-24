import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    if (!user) {
      return null;
    }
    return this.userService.findOne(user.userId);
  }

  @Get('all')
  async getAll(@Query('includeInactive') includeInactive: string, @CurrentUser() user: any) {
    return this.userService.findAll(user.companyId, includeInactive === 'true');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: any) {
    return this.userService.create(createUserDto, currentUser.companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Verify user belongs to same company
    const foundUser = await this.userService.findOne(id);
    if (foundUser.companyId !== user.companyId) {
      throw new Error('User not found');
    }
    return foundUser;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.userService.update(id, updateUserDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.userService.remove(id, user.companyId);
  }
}

