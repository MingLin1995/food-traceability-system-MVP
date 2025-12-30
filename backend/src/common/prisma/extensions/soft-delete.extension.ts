import { Prisma } from '@prisma/client';

export const softDeleteExtension = Prisma.defineExtension({
    name: 'soft-delete',
    query: {
        user: {
            async delete({ args, query }) {
                return query({
                    ...args,
                    data: { ...(args as any).data, deletedAt: new Date() },
                    action: 'update',
                });
            },
            async deleteMany({ args, query }) {
                return query({
                    ...args,
                    data: { ...(args as any).data, deletedAt: new Date() },
                    action: 'updateMany',
                });
            },
            async findFirst({ args, query }) {
                args.where = { deletedAt: null, ...args.where };
                return query(args);
            },
            async findMany({ args, query }) {
                args.where = { deletedAt: null, ...args.where };
                return query(args);
            },
            async findUnique({ args, query }) {
                return query({
                    ...args,
                    where: { ...args.where, deletedAt: null },
                });
            },
        },
    },
});
