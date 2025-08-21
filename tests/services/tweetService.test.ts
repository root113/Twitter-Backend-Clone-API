/*
    ^ Unit tests for TweetService covering:
    ?  - createTweet (owner-not-found, success, Prisma P2023, db error)
    ?  - listAllUserTweets (owner-not-found, success, Prisma P2023, db error)
    ?  - getTweetById (success, not-found, Prisma P2023, db error)
    ?  - updateTweetById (success with partial data, Prisma P2023, db error)
    ?  - deleteTweetById (success, not-found, Prisma P2023, db error)
*/

interface MockedModelMethods {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
}

jest.mock('../../src/clients/prisma', () => {
    const user = {
        findUnique: jest.fn(),
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
import { TweetService } from '../../src/services/tweetService';

const mockedPrisma = prisma as unknown as {
    user: MockedModelMethods;
    tweet: MockedModelMethods
};

describe('TweetService (unit)', () => {
    const service = new TweetService();

    beforeEach(() => {
        Object.values(mockedPrisma.user).forEach((m: any) => m?.mockReset && m.mockReset());
        Object.values(mockedPrisma.tweet).forEach((m: any) => m?.mockReset && m.mockReset());
    });

    //* ---- createTweet ----
    test('createTweet - success returns mapped tweet', async () => {
        const owner = { id: '507f1f77bcf86cd799439011' };
        mockedPrisma.user.findUnique.mockResolvedValue(owner);

        const dbTweet = { 
            id: 't1', 
            content: 'hi', 
            image: null, 
            impression: 0, 
            userId: owner.id 
        };
        mockedPrisma.tweet.create.mockResolvedValue(dbTweet);

        const result = await service.createTweet(dbTweet.content, owner.id, null);
        
        expect(mockedPrisma.tweet.create).toHaveBeenCalledWith({
            data: { 
                content: dbTweet.content, 
                image: null, 
                userId: owner.id 
            }
        });
        expect(result.payload).toEqual({
            content: dbTweet.content,
            image: null,
            impression: 0,
        });
        expect(result.message).toMatch(/created/i);
    });

    test('createTweet -> owner not found throws 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);
        await expect(service.createTweet('hello', '507f1f77bcf86cd799439011', null)).rejects.toMatchObject({ status: 404 });
    });

    test('createTweet - Prisma P2023 -> 404', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue({ code: 'P2023' });
        await expect(service.createTweet('c', 'bad', null)).rejects.toMatchObject({ status: 404 });
    });

    test('createTweet - other database error -> 500', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue(new Error('dbfail'));
        await expect(service.createTweet('c', 'u', null)).rejects.toMatchObject({ status: 500 });
    });

    //* ---- listAllUserTweets ----
    test('listAllUserTweets - success returns mapped tweets', async () => {
        const owner = { id: 'u1' };
        mockedPrisma.user.findUnique.mockResolvedValue(owner);

        const dbTweets = [
            { id: 't1', content: 'a', image: null, impression: 1, userId: owner.id },
            { id: 't2', content: 'b', image: null, impression: 2, userId: owner.id },
        ];
        mockedPrisma.tweet.findMany.mockResolvedValue(dbTweets);

        const result = await service.listAllUserTweets(owner.id);
        expect(mockedPrisma.tweet.findMany).toHaveBeenCalledWith({ where: { userId: owner.id } });
        expect(result.payload).toEqual(dbTweets.map(t => ({ content: t.content, image: null, impression: t.impression })));
    });

    test('listAllUserTweets - owner not found -> 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);
        await expect(service.listAllUserTweets('u1')).rejects.toMatchObject({ status: 404 });
    });

    test('listAllUserTweets - Prisma P2023 -> 404', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue({ code: 'P2023' });
        await expect(service.listAllUserTweets('bad')).rejects.toMatchObject({ status: 404 });
    });

    test('listAllUserTweets - other database error -> 500', async () => {
        mockedPrisma.user.findUnique.mockRejectedValue(new Error('boom'));
        await expect(service.listAllUserTweets('u')).rejects.toMatchObject({ status: 500 });
    });

    //* ---- getTweetById ----
    test('getTweetById - success returns mapped tweet', async () => {
        const dbTweet = { id: 't1', content: 'hello', image: null, impression: 0 };
        mockedPrisma.tweet.findUnique.mockResolvedValue(dbTweet);

        const result = await service.getTweetById('t1');
        expect(mockedPrisma.tweet.findUnique).toHaveBeenCalledWith({ where: { id: 't1' } });
        expect(result.payload).toEqual({ content: dbTweet.content, image: null, impression: 0 });
    });

    test('getTweetById - not found -> 404', async () => {
        mockedPrisma.tweet.findUnique.mockResolvedValue(null);
        await expect(service.getTweetById('no')).rejects.toMatchObject({ status: 404 });
    });

    test('getTweetById - Prisma P2023 -> 404', async () => {
        mockedPrisma.tweet.findUnique.mockRejectedValue({ code: 'P2023' });
        await expect(service.getTweetById('bad')).rejects.toMatchObject({ status: 404 });
    });

    test('getTweetById - other db error -> 500', async () => {
        mockedPrisma.tweet.findUnique.mockRejectedValue(new Error('err'));
        await expect(service.getTweetById('t')).rejects.toMatchObject({ status: 500 });
    });

    //* ---- updateTweetById ----
    test('updateTweetById - success updates only provided fields and returns mapped tweet', async () => {
        const dbTweet = { id: 't1', content: 'new', image: null, impression: 5 };
        mockedPrisma.tweet.update.mockResolvedValue(dbTweet);

        const result = await service.updateTweetById('t1', 'new', undefined);
        expect(mockedPrisma.tweet.update).toHaveBeenCalledWith({
            where: { id: 't1' },
            data: {
                ...( 'new' !== undefined && { content: 'new' }),
                ...( undefined !== undefined && { image: undefined }),
            }
        });
        expect(result.payload).toEqual({ content: 'new', image: null, impression: 5 });
        expect(result.message).toMatch(/updated/i);
    });

    test('updateTweetById - Prisma P2023 -> 404', async () => {
        mockedPrisma.tweet.update.mockRejectedValue({ code: 'P2023' });
        await expect(service.updateTweetById('bad', 'c', null)).rejects.toMatchObject({ status: 404 });
    });

    test('updateTweetById - other database error -> 500', async () => {
        mockedPrisma.tweet.update.mockRejectedValue(new Error('fail'));
        await expect(service.updateTweetById('t', 'c', null)).rejects.toMatchObject({ status: 500 });
    });

    //* ---- deleteTweetById ----
    test('deleteTweetById - success deletes tweet', async () => {
        const dbTweet = { id: 't1', content: 'x' };
        mockedPrisma.tweet.findUnique.mockResolvedValue(dbTweet);
        mockedPrisma.tweet.delete.mockResolvedValue(dbTweet);

        await expect(service.deleteTweetById(dbTweet.id)).resolves.toBeUndefined();
        expect(mockedPrisma.tweet.findUnique).toHaveBeenCalledWith({ where: { id: dbTweet.id } });
        expect(mockedPrisma.tweet.delete).toHaveBeenCalledWith({ where: { id: dbTweet.id } });
    });

    test('deleteTweetById - not found -> 404', async () => {
        mockedPrisma.tweet.findUnique.mockResolvedValue(null);
        await expect(service.deleteTweetById('nope')).rejects.toMatchObject({ status: 404 });
    });

    test('deleteTweetById - Prisma P2023 -> 404', async () => {
        mockedPrisma.tweet.findUnique.mockRejectedValue({ code: 'P2023' });
        await expect(service.deleteTweetById('bad')).rejects.toMatchObject({ status: 404 });
    });

    test('deleteTweetById - other db error -> 500', async () => {
        mockedPrisma.tweet.findUnique.mockRejectedValue(new Error('dberr'));
        await expect(service.deleteTweetById('id')).rejects.toMatchObject({ status: 500 });
    });
});
