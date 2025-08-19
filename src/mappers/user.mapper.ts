import type { User } from "../generated/prisma";

export function toUserResponse(user: User) {
    return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image ?? null,
        bio: user.bio ?? null
    };
}
