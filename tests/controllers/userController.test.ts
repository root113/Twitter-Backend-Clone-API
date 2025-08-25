/*
    ^ Unit tests for controllers in src/controllers/userController.ts
    ? - Tests success responses for create/list/get/update/delete
    ? - Tests that errors from the service are forwarded to next()

    ! IMPORTANT: we mock ../../src/services/userService before requiring the controller
    ! (controllers instantiate services at import time).
*/

describe('userController (unit)', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    //* ---- createUser ----
    test('createUser - success -> responds 201 with payload', async () => {
        const fakeResponse = { payload: { email: 'a@b.com', name: 'A', username: 'aa'}, message: 'ok' };

        // mock the service module before importing controller
        jest.doMock('../../src/services/userService', () => {
            return {
                UserService: jest.fn().mockImplementation(() => ({
                    createUser: jest.fn().mockResolvedValue(fakeResponse),
                }))
            };
        });

        const { createUser } = await import('../../src/controllers/userController');

        const req: any = { body: { email: 'a@b.com', name: 'A', username: 'aa' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await createUser(req, res, next);

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('createUser - service error -> forwarded to next', async () => {
        const err = new Error('service fail');

        jest.doMock('../../src/services/userService', () => {
            return {
                UserService: jest.fn().mockImplementation(() => ({
                    createUser: jest.fn().mockRejectedValue(err),
                }))
            };
        });

        const { createUser } = await import('../../src/controllers/userController');

        const req: any = { body: { email: 'a@b.com', name: 'A', username: 'aa' } };
        const res: any = {};
        const next = jest.fn();

        await createUser(req, res, next);

        // asyncHandler wrapper should call next(err) when the underlying promise rejects
        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    test('createUser - missing fields -> forwarded to next', async () => {
        const err = new Error('Invalid input');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                createUser: jest.fn().mockRejectedValue(err)
            }))
        }));

        const { createUser } = await import('../../src/controllers/userController');
        const req: any = { body: {} };
        const res: any = {};
        const next = jest.fn();

        createUser(req, res, next);
        await new Promise(setImmediate);

        expect(next).toHaveBeenCalledWith(err);
    });

    //* ---- listAllUsers ----
    test('listAllUsers - success -> responds 200 with list', async () => {
        const fakeResponse = { payload: [{ email: 'a@b', name: 'A', username: 'aa' }], message: 'ok' };

        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                listAllUsers: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { listAllUsers } = await import('../../src/controllers/userController');

        const req: any = {};
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await listAllUsers(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('listAllUsers - service error -> forwarded to next', async () => {
        const err = new Error('list fail');

        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                listAllUsers: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { listAllUsers } = await import('../../src/controllers/userController');

        const req: any = {};
        const res: any = {};
        const next = jest.fn();

        await listAllUsers(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    //* ---- getUserById ----
    test('getUserById -success -> responds 200 with payload', async () => {
        const fakeResponse = { payload: { email: 'b@b', name: 'B', username: 'bb' }, message: 'ok' };

        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                getUserById: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { getUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '507f1f77bcf86cd799439011' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await getUserById(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('getUserById - service error -> forwarded to next', async () => {
        const err = new Error('get fail');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                getUserById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { getUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '507f1f77bcf86cd799439011' } };
        const res: any = {};
        const next = jest.fn();

        await getUserById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    test('getUserById - invalid id format -> forwarded to next', async () => {
        const err = new Error('Invalid ID');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                getUserById: jest.fn().mockRejectedValue(err)
            }))
        }));

        const { getUserById } = await import('../../src/controllers/userController');
        const req: any = { params: { id: 'not-an-id' } };
        const res: any = {};
        const next = jest.fn();

        getUserById(req, res, next);
        await new Promise(setImmediate);

        expect(next).toHaveBeenCalledWith(err);
    });

    //* ---- updateUserById ----
    test('updateUserById - success -> responds 200 with payload', async () => {
        const fakeResponse = { payload: { email: 'b@b', name: 'B2', username: 'bb' }, message: 'updated' };

        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                updateUserById: jest.fn().mockResolvedValue(fakeResponse),
            }))
        }));

        const { updateUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '1' }, body: { name: 'B2' } };
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res: any = { status };
        const next = jest.fn();

        await updateUserById(req, res, next);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
        expect(next).not.toHaveBeenCalled();
    });

    test('updateUserById - service error -> forwarded to next', async () => {
        const err = new Error('update fail');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                updateUserById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { updateUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '1' }, body: { name: 'B2' } };
        const res: any = {};
        const next = jest.fn();

        await updateUserById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    test('updateUserById - invalid id - forwarded to next', async () => {
        const err = new Error('Invalid ID');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                updateUserById: jest.fn().mockRejectedValue(err)
            }))
        }));

        const { updateUserById } = await import('../../src/controllers/userController');
        const req: any = { body: { name: 'John Doe' }, params: { id: 'not-an-id' } }
        const res: any = {};
        const next = jest.fn();

        updateUserById(req, res, next);
        await new Promise(setImmediate);

        expect(next).toHaveBeenCalledWith(err);
    });

    test('updateUserById - missing fileds -> forwarded to next', async () => {
        const err = new Error('Invalid input');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                updateUserById: jest.fn().mockRejectedValue(err)
            }))
        }));

        const { updateUserById } = await import('../../src/controllers/userController');
        const req: any = { body: {}, params: 'u1' };
        const res: any = {};
        const next = jest.fn();

        updateUserById(req, res, next);
        await new Promise(setImmediate);

        expect(next).toHaveBeenCalledWith(err);
    });

    //* ---- deleteUserById ----
    test('deleteUserById - success -> responds 204 and sets headers', async () => {
        // mock delete resolves
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                deleteUserById: jest.fn().mockResolvedValue(undefined),
            }))
        }));

        const { deleteUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '1' } };
        const end = jest.fn();
        const status = jest.fn().mockReturnValue({ end });
        const set = jest.fn().mockReturnValue({ status });
        const res: any = { set };
        const next = jest.fn();

        await deleteUserById(req, res, next);

        expect(set).toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(204);
        expect(end).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test('deleteUserById - service error -> forwarded to next', async () => {
        const err = new Error('delete fail');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                deleteUserById: jest.fn().mockRejectedValue(err),
            }))
        }));

        const { deleteUserById } = await import('../../src/controllers/userController');

        const req: any = { params: { id: '1' } };
        const res: any = {};
        const next = jest.fn();

        await deleteUserById(req, res, next);

        expect(next).toHaveBeenCalled();
        expect((next.mock.calls[0] as any[])[0]).toBe(err);
    });

    test('deleteUserById - invalid id format -> forwarded to next', async () => {
        const err = new Error('Invalid ID');
        jest.doMock('../../src/services/userService', () => ({
            UserService: jest.fn().mockImplementation(() => ({
                deleteUserById: jest.fn().mockRejectedValue(err)
            }))
        }));

        const { deleteUserById } = await import('../../src/controllers/userController');
        const req: any = { params: { id: 'not-an-id' } };
        const res: any = {};
        const next = jest.fn();

        deleteUserById(req, res, next);
        await new Promise(setImmediate);

        expect(next).toHaveBeenCalledWith(err);
    });
});

/*
    TODO: Create integration tests/supertests 
    TODO: Add integration tests that exercise middleware + controllers together using supertest
*/