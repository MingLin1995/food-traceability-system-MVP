import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExtendedPrismaService } from '../common/prisma/extended-prisma.service';

@Injectable()
export class LogCleanupService {
    private readonly logger = new Logger(LogCleanupService.name);

    constructor(private readonly prisma: ExtendedPrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleLogCleanup() {
        this.logger.log('Running daily log cleanup...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const deletedLogs = await this.prisma.client.systemLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });

            this.logger.log(`Deleted ${deletedLogs.count} old logs.`);
        } catch (error) {
            this.logger.error('Failed to clean up logs', error);
        }
    }
}
