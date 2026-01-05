import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 120000, // 120 seconds for LLM responses
            maxRedirects: 5,
        }),
    ],
    controllers: [LlmController],
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule { }
