import type { User } from "../generated/prisma";

export function toUserResponse(user: User) {
    return {
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image ?? null,
        bio: user.bio ?? null
    };
}
