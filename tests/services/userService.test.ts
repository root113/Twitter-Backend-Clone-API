/**
 *? Tests UserService methods by mocking the prisma client exported from ../clients/prisma
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

const mockedPrisma = prisma as unknown as {
    user: MockedUserMethods;
};

describe('UserService', () => {
    const service = new UserService();

    beforeEach(() => {
        // jest.resetAllMocks();
        Object.values(mockedPrisma.user).forEach(mockFn => {
            if(typeof mockFn.mockReset === 'function') {
                mockFn.mockReset();
            }
        });
    });

    test('createUser -> returns mapped payload on success', async () => {
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
            data: { email: dbUser.email, name: dbUser.name, username: dbUser.username },
        });

        expect(result.payload).toEqual({
            email: dbUser.email,
            name: dbUser.name,
            username: dbUser.username,
            image: null,
            bio: null,
        });
        expect(result.message).toMatch(/created/i);
    });

    test('createUser -> database error leads to HttpError 500', async () => {
        mockedPrisma.user.create.mockRejectedValue(new Error('DB down'));

        await expect(service.createUser('a@b.com', 'A', 'aaa')).rejects.toMatchObject({
            status: 500,
        });
    });

    test('getUserById -> not found throws HttpError 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.getUserById('507f1f77bcf86cd799439011')).rejects.toMatchObject({
            status: 404,
        });
    });

    test('getUserById -> success returns mapped user', async () => {
        const dbUser = {
            id: '507f1f77bcf86cd799439011',
            email: 'bob@example.com',
            name: 'Bob',
            username: 'bob77',
            image: null,
            bio: 'hello',
        };
        mockedPrisma.user.findUnique.mockResolvedValue(dbUser);

        const res = await service.getUserById(dbUser.id);
        expect(res.payload).toEqual({
            email: dbUser.email,
            name: dbUser.name,
            username: dbUser.username,
            image: null,
            bio: 'hello',
        });
        expect(res.message).toMatch(/retrieved/i);
    });

  // TODO: add more tests: listAllUsers, updateUserById success + not found, deleteUserById success + not found
});
