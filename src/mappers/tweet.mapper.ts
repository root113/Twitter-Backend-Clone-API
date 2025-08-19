import type { Tweet } from "../generated/prisma";

export function toTweetResponse(tweet: Tweet) {
    return {
        id: String(tweet.id),
        content: tweet.content,
        image: tweet.image ?? null,
        impression: tweet.impression ?? 0
    };
}
