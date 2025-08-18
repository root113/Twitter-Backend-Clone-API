import HttpError from "../errors/HttpError";
import { PrismaClient, User } from "../generated/prisma";
import { Logger } from "../utils/Logger";

const prisma = new PrismaClient();

function validateTypes(
    value_id: unknown,
    value_1?: unknown,
    value_2?: unknown,
    value_3?: unknown,
    value_4?: unknown,
    value_5?: unknown
): { valid: boolean; message: string } {
    console.log('Validating types...');

    if(typeof value_id !== 'string' ) {
        return { valid: false, message: 'User ID must be a string!' }
    }

    if(value_1 !== undefined && typeof value_1 !== 'string' ) {
        return { valid: false, message: 'Email must be a string!' }
    }

    if(value_2 !== undefined && typeof value_2 !== 'string' ) {
        return { valid: false, message: 'Name must be a string!' }
    }

    if(value_3 !== undefined && typeof value_3 !== 'string' ) {
        return { valid: false, message: 'Username must be a string!' }
    }

    if(value_4 !== undefined && typeof value_4 !== 'string' ) {
        return { valid: false, message: 'Image must be a string!' }
    }

    if(value_5 !== undefined && typeof value_5 !== 'string' ) {
        return { valid: false, message: 'Bio must be a string!' }
    }

    return { valid: true, message: 'Validation successful' };
}

async function validateUserCreds(email: string, username: string): Promise<{ valid: boolean; message: string; }> {
    console.log('Checking if credentials are unique...');

    try {
        const intendedUser = await prisma.user.findUnique({
            where: { email: email, username: username }
        });

        if(intendedUser && intendedUser.email == email) {
            console.log('A user account associated with that email already exists!');
            return { valid: false, message: 'A user account associated with that email already exists!' }
        }

        if(intendedUser && intendedUser.username == username) {
            console.log('This username has already taken!');
            return { valid: false, message: 'This username has already taken!' }
        }

        return { valid: true, message: 'Credentials are unique' };
    } catch(err) {
        console.error('Database error: ', err);
        return { valid: false, message: 'An error has occured during the DB query!' }
    }
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
    async createUser(email: string, name: string, username: string): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> createUser');

        if(!email || !username) {
            console.log('Mandatory credentials were not provided!');
            throw new HttpError(400, 'Email and username are mandatory');
        }

        if(username.length <= 5) {
            console.log('Username should be at least 5 characters long!');
            throw new HttpError(409, 'Username should be at least 5 characters long!');
        }

        const validation = validateUserCreds(email, username);

        if(!(await validation).valid) {
            console.log('Invalid parameters: ', (await validation).message);
            throw new HttpError(409, (await validation).message);
        }

        try {
            const newUser = await prisma.user.create({
                data: { email, name, username }
            });

            const payload = {
                email: newUser.email,
                name: newUser.name,
                username: newUser.username,
                image: newUser.image,
                bio: newUser.bio
            };

            return { payload, message: 'User has been created successfuly' };
        } catch(err: any) {
            console.log('Database error while registering user', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async listAllUsers(): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> listAllUser');

        try {
            const allUsers = await prisma.user.findMany();
            const payload = allUsers.map(user => ({
                email: user.email,
                name: user.name,
                username: user.username,
                image: user.image,
                bio: user.bio
            }));

            return { payload, message: 'Operation successful' };
        } catch(err: any) {
            console.log('Database error while listing users', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async getUserById(userId: any): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> getUserById');

        const validation = validateTypes(userId);

        if(!validation.valid) {
            console.log(validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const getUser = await prisma.user.findUnique({ where: { id: userId } });
            
            if(!isUser(getUser)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            const payload = {
                email: getUser?.email,
                name: getUser?.name,
                username: getUser?.username,
                image: getUser?.image,
                bio: getUser?.bio
            };
            return { 
                payload,
                message: 'Successfuly retrieved user information'
            };
        } catch(err: any) {
            if (err.code === 'P2023') {
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
        image?: string, 
        bio?: string
    ): Promise<{ payload: any, message: string }>
    {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> updateUserById');

        const validation = validateTypes(userId, name, image, bio);

        if(!validation.valid) {
            console.log('Validation failed: ', validation.message);
            throw new HttpError(400, validation.message);
        }

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

            const payload = {
                email: updatedUser.email,
                name: updatedUser.name,
                username: updatedUser.username,
                image: updatedUser.image,
                bio: updatedUser.bio
            };
            return {
                payload,
                message: 'User has been updated successfuly'
            };
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }
            
            console.log('Database error while updating user information', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async deleteUserById(userId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'User -> deleteUserById');

        const validation = validateTypes(userId);

        if(!validation.valid) {
            console.log('Validation failed: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const deleteUser = await prisma.user.findUnique({ where: { id: userId} });
            
            if(!isUser(deleteUser)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            await prisma.user.delete({ where: { id: userId} });
            console.log('User has been deleted successfuly');
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }
            
            console.log('Database error while deleting user', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
}
