import { z } from 'zod';

export const CreateUserBodyDto = z.object({
    email: z.email(),
    name: z.string().min(1).max(100),
    username: z.string().min(5).max(30),
}).strict();
export type CreateUserBodyDto = z.infer<typeof CreateUserBodyDto>;

export const UpdateUserBodyDto = z.object({
    name: z.string().min(1).max(100).optional(),
    image: z.url().optional().nullable(),
    bio: z.string().max(160).optional(),
}).strict();
export type UpdateUserBodyDto = z.infer<typeof UpdateUserBodyDto>;

export const UserResponseDto = z.object({
    email: z.email(),
    name: z.string(),
    username: z.string(),
    image: z.url().optional().nullable(),
    bio: z.string().optional().nullable(),
});
export type UserResponseDto = z.infer<typeof UserResponseDto>;
