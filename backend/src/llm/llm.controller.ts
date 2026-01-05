import { Controller, Post, Get, Body } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiOkResponseGeneric } from '../common/decorators/api-ok-response-generic.decorator';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('LLM')
@Controller('llm')
@Public()
export class LlmController {
    constructor(private readonly llmService: LlmService) { }

    @Post('chat')
    @ApiOkResponseGeneric(ChatResponseDto)
    async chat(@Body() chatRequest: ChatRequestDto) {
        return this.llmService.chat(chatRequest);
    }

    @Get('health')
    async health() {
        return this.llmService.healthCheck();
    }
}
