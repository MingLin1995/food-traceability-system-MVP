import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ExtendedPrismaService } from '../common/prisma/extended-prisma.service';
import { Prisma } from '@prisma/client';
import { RegisterDto } from '../auth/dto/auth.dto';
import { UpdateUserDto } from './dto/user.dto';
import { Role } from '../common/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';
import { UserQueryDto } from './dto/user-query.dto';
import { calculatePagination, createPaginatedResponse } from '../common/utils/pagination.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: ExtendedPrismaService) { }
  async findByAccount(account: string) {
    return this.prisma.client.user.findFirst({
      where: {
        account,
      },
    });
  }

  async create(registerDto: RegisterDto) {
    // 這邊使用 raw client (this.prisma.user) 而不是 extended client (this.prisma.client.user)
    // 是為了能找到包含 soft-deleted 的使用者，以便進行 restore 相關邏輯
    const existingUser = await this.prisma.user.findUnique({
      where: { account: registerDto.account },
    });

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const userData = {
      ...registerDto,
      password: hashedPassword,
      role: Role.USER,
    };

    if (existingUser) {
      if (existingUser.deletedAt) {
        return this.prisma.client.user.update({
          where: { account: registerDto.account },
          data: {
            ...userData,
            deletedAt: null,
            updatedAt: new Date(),
          },
        });
      }

      throw new ConflictException('帳號已存在');
    }

    return this.prisma.client.user.create({
      data: userData,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findFirst({
      where: { id, },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`用戶不存在`);
    }

    return user;
  }

  async findAll(queryDto: UserQueryDto) {
    const { skip, take } = calculatePagination(queryDto);
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const where: Prisma.UserWhereInput = {
      // 帳號搜尋（模糊搜尋，不區分大小寫）
      ...(queryDto.account && {
        account: {
          contains: queryDto.account,
          mode: 'insensitive',
        },
      }),
      // Email 搜尋（模糊搜尋，不區分大小寫）
      ...(queryDto.email && {
        email: {
          contains: queryDto.email,
          mode: 'insensitive',
        },
      }),
      // 電話搜尋（模糊搜尋）
      ...(queryDto.phone && {
        phone: {
          contains: queryDto.phone,
        },
      }),
      // 角色篩選
      ...(queryDto.role && { role: queryDto.role }),
    };

    const [data, total] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        skip,
        take,
        omit: { password: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.user.count({ where }),
    ]);

    return createPaginatedResponse(data, page, limit, total);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.client.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用戶不存在`);
    }

    const dataToUpdate = { ...updateUserDto };
    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    return this.prisma.client.user.update({
      where: { id },
      data: dataToUpdate,
      omit: { password: true },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`用戶不存在`);
    }

    await this.prisma.client.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: '用戶已刪除' };
  }
}
