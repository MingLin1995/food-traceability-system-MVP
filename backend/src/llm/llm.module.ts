import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 300000, // 300 seconds (5 mins) for slow LLM responses
            maxRedirects: 5,
        }),
    ],
    controllers: [LlmController],
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule { }
