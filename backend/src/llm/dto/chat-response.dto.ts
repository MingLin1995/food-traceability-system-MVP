import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatResponseDataDto {
  @ApiProperty({
    description: 'LLM Response',
    example: '目前有以下食材...',
  })
  @IsString()
  response!: string;

  @ApiProperty({
    description: 'LLM Model',
    example: 'llama2',
  })
  @IsString()
  model!: string;
}

export class ChatResponseDto {
  @ApiProperty({ type: ChatResponseDataDto })
  data!: ChatResponseDataDto;
}
