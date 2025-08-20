/**
 *^ Note: controllers instantiate `new UserService()` at module load.
 *^ We'll mock the class to control its instance methods.
*/

jest.mock('../../src/services/userService', () => {
    return {
        UserService: jest.fn().mockImplementation(() => ({
            createUser: jest.fn(),
            listAllUsers: jest.fn(),
            getUserById: jest.fn(),
            updateUserById: jest.fn(),
            deleteUserById: jest.fn(),
        })),
    };
});

import { createUser } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';

describe('userController.createUser', () => {
    const mockCreate = (UserService as jest.Mock).mock.instances[0]?.createUser;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createUser -> responds 201 with payload', async () => {
        const fakeResponse = { payload: { email: 'a@b.com', name: 'A', username: 'aa'}, message: 'ok' };
        
        // ensure the mocked instance method resolves correctly
        (UserService as unknown as jest.Mock).mockImplementationOnce(() => ({
            createUser: jest.fn().mockResolvedValue(fakeResponse),
        }));

        // re-require controller to pick up new mock instance (or create fresh function)
        const { createUser: createUserHandler } = require('../../src/controllers/userController');

        const req = { body: { email: 'a@b.com', name: 'A', username: 'aa' } } as any;
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({ json });
        const res = { status } as any;

        await createUserHandler(req, res, jest.fn());
        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith({ payload: fakeResponse.payload, message: fakeResponse.message });
    });

    // TODO: add tests for other requests
});
