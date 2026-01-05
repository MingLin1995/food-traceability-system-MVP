import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    role!: string;

    @IsString()
    @IsNotEmpty()
    content!: string;
}

export class ChatRequestDto {
    @IsString()
    @IsNotEmpty()
    message!: string;

    @IsArray()
    @IsOptional()
    conversation_history?: ChatMessageDto[];
}
