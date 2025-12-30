
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
    @ApiProperty({ example: 'MG20241201-001' })
    @IsString()
    @IsNotEmpty()
    batchNumber!: string;

    @ApiProperty({ example: '愛文芒果' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: '台南玉井' })
    @IsString()
    @IsNotEmpty()
    origin!: string;

    @ApiProperty({ example: '玉井果農合作社' })
    @IsString()
    @IsNotEmpty()
    supplier!: string;

    @ApiProperty({ example: '2024-12-01T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    productionDate!: string;

    @ApiProperty({ example: '2024-12-15T00:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    expiryDate!: string;

    @ApiProperty({ example: '合格' })
    @IsString()
    @IsNotEmpty()
    testResult!: string;

    @ApiProperty({ example: { pesticide: '0.01ppm', heavyMetal: '未檢出' } })
    @IsOptional()
    testDetails?: Record<string, any>;
}
