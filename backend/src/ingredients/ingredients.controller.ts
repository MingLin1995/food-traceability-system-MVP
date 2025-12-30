import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient.dto';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ApiOkResponseGeneric, ApiOkResponseGenericArray, ApiCreatedResponseGeneric } from '../common/decorators/api-ok-response-generic.decorator';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { Roles, Role } from '../common/decorators/roles.decorator';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) { }

    @Post()
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: '建立新食材' })
    @ApiCreatedResponseGeneric(IngredientResponseDto)
    @ApiBody({ type: CreateIngredientDto })
    create(@Body() createIngredientDto: CreateIngredientDto) {
        return this.ingredientsService.create(createIngredientDto);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: '取得所有食材列表' })
    @ApiOkResponseGenericArray(IngredientResponseDto)
    findAll() {
        return this.ingredientsService.findAll();
    }

    @Public()
    @Get(':batchNumber')
    @ApiOperation({ summary: '根據批號取得食材資訊' })
    @ApiOkResponseGeneric(IngredientResponseDto)
    findOne(@Param('batchNumber') batchNumber: string) {
        return this.ingredientsService.findOneByBatch(batchNumber);
    }

    @Put(':id')
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: '更新食材資訊' })
    @ApiOkResponseGeneric(IngredientResponseDto)
    @ApiBody({ type: UpdateIngredientDto })
    update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
        return this.ingredientsService.update(id, updateIngredientDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: '刪除食材' })
    @ApiOkResponseGeneric(MessageResponseDto)
    remove(@Param('id') id: string) {
        return this.ingredientsService.remove(id);
    }
}
