/*
    ^ Unit tests for UserService covering: 
    ?  - createUser (success, db error)
    ?  - listAllUsers (success, db error)
    ?  - getUserById (success, not-found, Prisma P2023, other db error)
    ?  - updateUserById (success, Prisma P2023 -> 404, other db error)
    ?  - deleteUserById (success, not-found, Prisma P2023 -> 404, other db error)
*/

interface MockedUserMethods {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
}

jest.mock('../../src/clients/prisma', () => {
    const user = {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    // tweet not used in these tests but keep shape consistent
    const tweet = {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    return { prisma: { user, tweet } };
});

import { prisma } from '../../src/clients/prisma';
import { UserService } from '../../src/services/userService';
import HttpError from '../../src/errors/HttpError';
import { email } from 'zod';

const mockedPrisma = prisma as unknown as {
    user: MockedUserMethods;
    tweet: Record<string, jest.Mock>
};

describe('UserService (unit)', () => {
    const service = new UserService();

    beforeEach(() => {
        // jest.resetAllMocks();
        Object.values(mockedPrisma.user).forEach((m: any) => m?.mockReset && m.mockReset());
        Object.values(mockedPrisma.tweet).forEach((m: any) => m?.mockReset && m.mockReset());
    });

    //* ---- createUser ----
    test('createUser - success returns mapped payload', async () => {
        const dbUser = {
            id: '507f1f77bcf86cd799439011',
            email: 'alice@example.com',
            name: 'Alice',
            username: 'alice123',
            image: null,
            bio: null,
        };
        mockedPrisma.user.create.mockResolvedValue(dbUser);

        const result = await service.createUser(dbUser.email, dbUser.name, dbUser.username);

        expect(mockedPrisma.user.create).toHaveBeenCalledWith({
            data: { 
                email: dbUser.email, 
                name: dbUser.name, 
                username: dbUser.username 
            },
        });

        expect(result.payload).toEqual({
            email: dbUser.email,
            name: dbUser.name,
            username: dbUser.username,
            image: null,
            bio: null,
        });
        expect(result.message.toLowerCase()).toContain('created');
    });

    test('createUser - database error -> throws HttpError 500', async () => {
        mockedPrisma.user.create.mockRejectedValue(new Error('DB down'));
        await expect(service.createUser('a@b.com', 'A', 'aaa')).rejects.toMatchObject({ status: 500 });
    });

    //* ---- listAllUsers ----
    test('listAllUsers - success returns mapped list', async () => {
        const dbUsers = [
            { id: '1', email: 'a@b', name: 'A', username: 'aa', image: null, bio: null },
            { id: '2', email: 'a@b', name: 'C', username: 'cc', image: null, bio: 'hi' }
        ];
        mockedPrisma.user.findMany.mockResolvedValue(dbUsers);

        const result = await service.listAllUsers();
        expect(mockedPrisma.user.findMany).toHaveBeenCalled();
        expect(result.payload).toEqual(dbUsers.map(u => ({
            email: u.email,
            name: u.name,
            username: u.username,
            image: null,
            bio: u.bio
        })));
        expect(result.message).toMatch(/operation successful/i);
    });

    test('listAllUsers - database error -> throws HttpError 500', async () => {
        mockedPrisma.user.findMany.mockRejectedValue(new Error('fail listing'));
        await expect(service.listAllUsers()).rejects.toMatchObject({ status: 500 });
    });

    //* ---- getUserById ----
    test('getUserById - success returns mapped user', async () => {
        const dbUser = {
            id: '507f1f77bcf86cd799439011',
            email: 'bob@example.com',
            name: 'Bob',
            username: 'bob77',
            image: null,
            bio: 'hello',
        };
        mockedPrisma.user.findUnique.mockResolvedValue(dbUser);

        const result = await service.getUserById(dbUser.id);
        expect(result.payload).toEqual({
            email: dbUser.email,
            name: dbUser.name,
            username: dbUser.username,
            image: null,
            bio: 'hello',
        });
        expect(result.message).toMatch(/retrieved/i);
    });
    
    test('getUserById - not found -> throws HttpError 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);
        await expect(service.getUserById('507f1f77bcf86cd799439011')).rejects.toMatchObject({ status: 404 });
    });

    test('getUserById - Prisma P2023 -> maps to 404', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue({
            code: 'P2023',
            message: 'Invalid input!'
        });

        await expect(service.getUserById('bad-id')).rejects.toMatchObject({ status: 404 });
    });

    test('getUserById - other database error -> 500', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue(new Error('boom'));
        await expect(service.getUserById('507f1f77bcf86cd799439011')).rejects.toMatchObject({ status: 500 });
    });

    //* ---- updateUserById ----
    test('updateUserById - success updates and return mapped user (only provided fields)', async () => {
        const dbUserUpdated = {
            id: '1',
            email: 'e', 
            name: 'New Name', 
            username: 'user', 
            image: null, 
            bio: 'bio'
        };
        mockedPrisma.user.update.mockResolvedValue(dbUserUpdated);

        const result = await service.updateUserById('1', 'New Name', undefined, 'bio');
        
        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: {
                ...( 'New Name' !== undefined && { name: 'New Name' }),
                ...( undefined !== undefined && { image: undefined }), // won't include
                ...( 'bio' !== undefined && { bio: 'bio' }),
            }
        });
        expect(result.payload).toEqual({
            email: dbUserUpdated.email,
            name: dbUserUpdated.name,
            username: dbUserUpdated.username,
            image: null,
            bio: 'bio'
        });
    });

    test('updateUserById - Prisma P2023 -> 404', async () => {
        mockedPrisma.user.update.mockRejectedValue({ code: 'P2023' });
        await expect(service.updateUserById('bad', 'n', null, 'b')).rejects.toMatchObject({ status: 404 });
    });

    test('updateUserById - other database error -> 500', async () => {
        mockedPrisma.user.update.mockRejectedValue(new Error('update fail'));
        await expect(service.updateUserById('1', 'n', null, 'b')).rejects.toMatchObject({ status: 500 });
    });

    //* ---- deleteUserById ----
    test('deleteUserById - success deletes user', async () => {
        const dbUser = { id: 'del1', email: 'x', name: 'X', username: 'x' };
        mockedPrisma.user.findUnique.mockResolvedValue(dbUser);
        mockedPrisma.user.delete.mockResolvedValue(dbUser);

        await expect(service.deleteUserById(dbUser.id)).resolves.toBeUndefined();
        
        expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: dbUser.id } });
        expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: dbUser.id } });
    });

    test('deleteUserById - not found -> 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);
        await expect(service.deleteUserById('missing')).rejects.toMatchObject({ status: 404 });
    });

    test('deleteUserById - Prisma P2023 -> 404', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue({ code: 'P2023' });
        await expect(service.deleteUserById('bad')).rejects.toMatchObject({ status: 404 });
    });

    test('deleteUserById - other db error -> 500', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue(new Error('boom'));
        await expect(service.deleteUserById('id')).rejects.toMatchObject({ status: 500 });
    });
});
