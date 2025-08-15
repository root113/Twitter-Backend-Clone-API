import { PrismaClient, User } from "../generated/prisma";
import { Logger } from "../utils/Logger";

const prisma = new PrismaClient();

function isTypecheck(value: any) {
    console.log(`Typechecking: ${value}...`);

    if(typeof value === 'string') {
        console.log(`Typecheck for value: ${value} successful`);
        return true;
    }
    console.log(`Typecheck for value: ${value} failed`);
    return false;
}

function isUser(user: User | null | undefined) {
    console.log('Checking DB entities if user exists with the id provided...');

    if(!user) {
        console.log(Logger.LOG_USER_NOT_FOUND);
        return false;
    }
    console.log(Logger.LOG_USER_FOUND);
    return true;
}

export class UserService {
    async createUser(email: string, name: string, username: string) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> createUser');

        const newUser = await prisma.user.create({
            data: { email, name, username }
        });
        console.log('User has been created successfuly');

        const payload = {
            email: newUser.email,
            name: newUser.name,
            username: newUser.username,
            image: newUser.image,
            bio: newUser.bio
        };

        return payload;
    }

    async listAllUsers() {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> listAllUser');

        const allUsers = await prisma.user.findMany();
        const payload = allUsers.map(user => ({
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.image,
            bio: user.bio
        }));
        return payload;
    }

    async getUserById(userId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> getUserById');

        if(!isTypecheck(userId)) {
            console.log('User ID is not in expected type!');
            return;
        }

        const getUser = await prisma.user.findUnique({ where: { id: userId } });
        if(!isUser(getUser)) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            return null;
        }

        const payload = {
            email: getUser?.email,
            name: getUser?.name,
            username: getUser?.username,
            image: getUser?.image,
            bio: getUser?.bio
        };
        return payload;
    }

    async updateUserById(userId: any, name: string, image: string, bio: string) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> updateUserById');

        if(!isTypecheck(userId)) {
            console.log('User ID is not in expected type!');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, image, bio }
        });

        if(!isUser(updatedUser)) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            return null;
        }

        const payload = {
            email: updatedUser.email,
            name: updatedUser.name,
            username: updatedUser.username,
            image: updatedUser.image,
            bio: updatedUser.bio
        };
        return payload;
    }

    async deleteUserById(userId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> deleteUserById');

        if(!isTypecheck(userId)) {
            console.log('User ID is not in expected type!');
            return;
        }

        const deleteUser = await prisma.user.findUnique({ where: { id: userId} });
        if(!isUser(deleteUser)) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            return;
        }

        return await prisma.user.delete({ where: { id: userId} });
    }
}