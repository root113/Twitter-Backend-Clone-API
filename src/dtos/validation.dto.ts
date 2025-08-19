import { z } from 'zod';

export const IdParamDto = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format!')
});
export type IdParamDto = z.infer<typeof IdParamDto>;

export const UserIdDto = z.object({
    userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userID format!')
});
export type UserIdDto = z.infer<typeof UserIdDto>;

export const PaginationQueryDto = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional().nullable()
});
export type PaginationQueryDto = z.infer<typeof PaginationQueryDto>;
