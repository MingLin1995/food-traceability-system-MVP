import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from './extensions/soft-delete.extension';

const extendedClientType = new PrismaClient().$extends(softDeleteExtension);
type ExtendedClientType = typeof extendedClientType;

@Injectable()
export class ExtendedPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private _extendedClient?: ExtendedClientType;

    get client(): ExtendedClientType {
        if (!this._extendedClient) {
            this._extendedClient = this.$extends(softDeleteExtension);
        }
        return this._extendedClient!;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
