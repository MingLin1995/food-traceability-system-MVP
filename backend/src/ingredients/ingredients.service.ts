
import { Injectable, NotFoundException } from '@nestjs/common';
import { ExtendedPrismaService } from '../common/prisma/extended-prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
    constructor(private readonly prisma: ExtendedPrismaService) { }

    async create(createIngredientDto: CreateIngredientDto) {
        const { productionDate, expiryDate, ...rest } = createIngredientDto;
        return this.prisma.client.ingredient.create({
            data: {
                ...rest,
                productionDate: new Date(productionDate),
                expiryDate: new Date(expiryDate),
            },
        });
    }

    findAll() {
        return this.prisma.client.ingredient.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOneByBatch(batchNumber: string) {
        const ingredient = await this.prisma.client.ingredient.findUnique({
            where: { batchNumber },
        });
        if (!ingredient) {
            throw new NotFoundException(`Ingredient with batch number ${batchNumber} not found`);
        }
        return ingredient;
    }

    async update(id: string, updateIngredientDto: UpdateIngredientDto) {
        const { productionDate, expiryDate, ...rest } = updateIngredientDto;

        const exists = await this.prisma.client.ingredient.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException(`Ingredient with ID ${id} not found`);

        const data: any = { ...rest };
        if (productionDate) data.productionDate = new Date(productionDate);
        if (expiryDate) data.expiryDate = new Date(expiryDate);

        return this.prisma.client.ingredient.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const exists = await this.prisma.client.ingredient.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException(`Ingredient with ID ${id} not found`);

        await this.prisma.client.ingredient.delete({
            where: { id },
        });

        return { message: 'Ingredient deleted successfully' };
    }
}
