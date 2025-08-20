interface MockedModelMethods {
    create: jest.Mock;
    findUnique: jest.Mock;
}

jest.mock('../clients/prisma', () => {
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

describe('TweetService', () => {
    const service = new TweetService();

    beforeEach(() => {
        Object.values(mockedPrisma.user).forEach((m: any) => m?.mockReset && m.mockReset());
        Object.values(mockedPrisma.tweet).forEach((m: any) => m?.mockReset && m.mockReset());
    });

    test('createTweet -> owner not found throws 404', async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.createTweet('hello', '507f1f77bcf86cd799439011', null)).rejects.toMatchObject({
            status: 404,
        });
    });

    test('createTweet -> success returns mapped payload', async () => {
        const owner = { id: '507f1f77bcf86cd799439011' };
        mockedPrisma.user.findUnique.mockResolvedValue(owner);

        const dbTweet = { id: 't1', content: 'hi', image: null, impression: 0, userId: owner.id };
        mockedPrisma.tweet.create.mockResolvedValue(dbTweet);

        const res = await service.createTweet('hi', owner.id, null);
        expect(res.payload).toEqual({
            content: dbTweet.content,
            image: null,
            impression: 0,
        });
    });

  // TODO: add more tests for listAllUserTweets, getTweetById, updateTweetById, deleteTweetById
});
