import HttpError from "../errors/HttpError";
import { User } from "../generated/prisma";
import { Logger } from "../utils/Logger";
import { toUserResponse } from "../mappers/user.mapper";
import { prisma } from "../clients/prisma";

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
    async createUser(email: string, name: string, username: string): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> createUser');

        try {
            const newUser = await prisma.user.create({
                data: { email, name, username }
            });

            return { payload: toUserResponse(newUser), message: 'User has been created successfuly' };
        } catch(err: any) {
            console.log('Database error while registering user', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async listAllUsers(): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> listAllUser');

        try {
            const allUsers = await prisma.user.findMany();
            const payload = allUsers.map(user => toUserResponse(user));
            return { payload, message: 'Operation successful' };
        } catch(err: any) {
            console.log('Database error while listing users', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async getUserById(userId: any): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> getUserById');

        try {
            const getUser = await prisma.user.findUnique({ where: { id: userId } });
            
            if(!isUser(getUser)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            return { 
                payload: toUserResponse(getUser!),
                message: 'Successfuly retrieved user information'
            };
        } catch(err: any) {
            if (err?.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }
            
            console.log('Database error while retrieving user information', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async updateUserById(
        userId: any, 
        name?: string, 
        image?: string | null, 
        bio?: string
    ): Promise<{ payload: any, message: string }>
    {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> updateUserById');

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { 
                    ...(name !== undefined && { name }), 
                    ...(image !== undefined && { image }), 
                    ...(bio !== undefined && { bio }),
                }
            });

            if(!isUser(updatedUser)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            return {
                payload: toUserResponse(updatedUser),
                message: 'User has been updated successfuly'
            };
        } catch(err: any) {
            if (err?.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }
            
            console.log('Database error while updating user information', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async deleteUserById(userId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> deleteUserById');

        try {
            const deleteUser = await prisma.user.findUnique({ where: { id: userId} });
            
            if(!isUser(deleteUser)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            await prisma.user.delete({ where: { id: userId} });
            console.log('User has been deleted successfuly');
        } catch(err: any) {
            if (err?.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }
            
            console.log('Database error while deleting user', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
}
