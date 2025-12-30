
import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new ingredient' })
    create(@Body() createIngredientDto: CreateIngredientDto) {
        return this.ingredientsService.create(createIngredientDto);
    }

    @Public() // Allow public access for consumers to query
    @Get()
    @ApiOperation({ summary: 'List all ingredients' })
    findAll() {
        return this.ingredientsService.findAll();
    }

    @Public()
    @Get(':batchNumber')
    @ApiOperation({ summary: 'Get ingredient by batch number' })
    @ApiResponse({ status: 404, description: 'Ingredient not found' })
    findOne(@Param('batchNumber') batchNumber: string) {
        return this.ingredientsService.findOneByBatch(batchNumber);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an ingredient' })
    update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
        return this.ingredientsService.update(id, updateIngredientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an ingredient' })
    remove(@Param('id') id: string) {
        return this.ingredientsService.remove(id);
    }
}
