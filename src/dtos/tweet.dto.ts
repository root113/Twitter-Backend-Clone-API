import { z } from "zod";
import { UserIdDto } from "./validation.dto";

export const CreateTweetBodyDto = z.object({
    content: z.string().min(1).max(1000),
    image: z.url().optional().nullable(),
    userId: UserIdDto.shape.userId
}).strict();
export type CreateTweetBodyDto = z.infer<typeof CreateTweetBodyDto>;

export const ListUserTweetsQueryDto = z.object({
    userId: UserIdDto.shape.userId,
});
export type ListUserTweetsQueryDto = z.infer<typeof ListUserTweetsQueryDto>;

export const UpdateTweetBodyDto = z.object({
    content: z.string().min(1).max(1000).optional(),
    image: z.url().optional().nullable()
}).strict();
export type UpdateTweetBodyDto = z.infer<typeof UpdateTweetBodyDto>;

// Response
export const TweetResponseDto = z.object({
    content: z.string(),
    image: z.url().optional().nullable(),
    impression: z.number().int()
});
export type TweetResponseDto = z.infer<typeof TweetResponseDto>;
