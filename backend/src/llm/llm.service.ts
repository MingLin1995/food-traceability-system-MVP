import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';

@Injectable()
export class LlmService {
    private readonly llmServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.llmServiceUrl = this.configService.get<string>(
            'LLM_SERVICE_INTERNAL_URL',
            'http://llm-service:8000',
        );
    }

    async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDataDto> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.llmServiceUrl}/chat/`, chatRequest),
            );

            return {
                response: response.data.response,
                model: response.data.model,
            };
        } catch (error: any) {
            console.error('LLM Service error:', error.message);
            throw new HttpException(
                {
                    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                    message: 'LLM 服務暫時無法使用，請稍後再試',
                    error: 'LLM Service Unavailable',
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    async healthCheck(): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.llmServiceUrl}/health`),
            );
            return response.data;
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Cannot connect to LLM service',
            };
        }
    }
}
