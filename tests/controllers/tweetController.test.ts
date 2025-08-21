/*
    ^ Unit tests for src/controllers/tweetController.ts
    ? - Tests create/list/get/update/delete controller behavior
    ? - Ensures success responses and forwarding of service errors to next()
*/

describe('tweetController (unit)', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    //* ---- createTweet ----
    test('createTweet - success -> responds 201 with payload', async () => {
        const fakeResponse = { payload: { content: 'hi', image: null, impression: 0 }, message: 'created' };

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                createTweet: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { createTweet } = await import('../../src/controllers/tweetController');

        const req: any = { body: { content: 'hi', userId: 'u1', image: null } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await createTweet(req, res, next);

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('createTweet - service error -> forwarded to next', async () => {
        const err = new Error('create fail');

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                createTweet: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { createTweet } = await import('../../src/controllers/tweetController');

        const req: any = { body: { content: 'hi', userId: 'u1', image: null } };
        const res: any = {};
        const next = jest.fn();

        await createTweet(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    //* ---- listAllTweets ----
    test('listAllTweets - success -> responds 200 with payload', async () => {
        const fakeResponse = { payload: [{ content: 'a', image: null, impression: 1 }], message: 'ok' };

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                listAllUserTweets: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { listAllTweets } = await import('../../src/controllers/tweetController');

        const req: any = { query: { userId: 'u1' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await listAllTweets(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('listAllTweets - service error -> forwarded to next', async () => {
        const err = new Error('list tweets fail');

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                listAllUserTweets: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { listAllTweets } = await import('../../src/controllers/tweetController');

        const req: any = { query: { userId: 'u1' } };
        const res: any = {};
        const next = jest.fn();

        await listAllTweets(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    //* ---- getTweetById ----
    test('getTweetById - success -> responds 200 with payload', async () => {
        const fakeResponse = { payload: { content: 'hi', image: null, impression: 0 }, message: 'ok' };

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                getTweetById: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { getTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await getTweetById(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('getTweetById - service error -> forwarded to next', async () => {
        const err = new Error('get tweet fail');

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                getTweetById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { getTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' } };
        const res: any = {};
        const next = jest.fn();

        await getTweetById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    //* ---- updateTweetById ----
    test('updateTweetById - success -> responds 200 with payload', async () => {
        const fakeResponse = { payload: { content: 'new', image: null, impression: 5 }, message: 'updated' };

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                updateTweetById: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { updateTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' }, body: { content: 'new' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await updateTweetById(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('updateTweetById - service error -> forwarded to next', async () => {
        const err = new Error('update tweet fail');

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                updateTweetById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { updateTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' }, body: { content: 'new' } };
        const res: any = {};
        const next = jest.fn();

        await updateTweetById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    //* ---- deleteTweetById ----
    test('deleteTweetById - success -> responds 204 and sets headers', async () => {
        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                deleteTweetById: jest.fn().mockResolvedValue(undefined),
            }))
        }));

        const { deleteTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' } };
        const end = jest.fn();
        const status = jest.fn().mockReturnValue({ end });
        const set = jest.fn().mockReturnValue({ status });
        const res: any = { set };
        const next = jest.fn();

        await deleteTweetById(req, res, next);

        expect(set).toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(204);
        expect(end).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('deleteTweetById - service error -> forwarded to next', async () => {
        const err = new Error('delete fail');

        jest.doMock('../../src/services/tweetService', () => ({
            TweetService: jest.fn().mockImplementation(() => ({
                deleteTweetById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { deleteTweetById } = await import('../../src/controllers/tweetController');

        const req: any = { params: { id: 't1' } };
        const res: any = {};
        const next = jest.fn();

        await deleteTweetById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });
});
