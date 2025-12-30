import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
    @ApiProperty({ description: '食材 ID', example: 'uuid-string' })
    id!: string;

    @ApiProperty({ description: '批號', example: 'MG20241201-001' })
    batchNumber!: string;

    @ApiProperty({ description: '食材名稱', example: '愛文芒果' })
    name!: string;

    @ApiProperty({ description: '原產地', example: '台南玉井' })
    origin!: string;

    @ApiProperty({ description: '供應商', example: '玉井果農合作社' })
    supplier!: string;

    @ApiProperty({ description: '生產日期', example: '2024-12-01T00:00:00.000Z' })
    productionDate!: Date;

    @ApiProperty({ description: '過期日期', example: '2024-12-15T00:00:00.000Z' })
    expiryDate!: Date;

    @ApiProperty({ description: '檢驗結果', example: '合格' })
    testResult!: string;

    @ApiProperty({ description: '檢驗細項', example: { pesticide: '0.01ppm', heavyMetal: '未檢出' }, required: false, nullable: true })
    testDetails?: Record<string, any> | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
