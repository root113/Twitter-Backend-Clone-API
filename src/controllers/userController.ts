import asyncHandler from 'express-async-handler';
import { Logger } from '../utils/Logger';
import { UserService } from '../services/userService';

const userService = new UserService();

const createUser = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> createUser');
    const { email, name, username } = req.body;
    console.log('Request body params: ', email, name, username);

    try {
        const payload = await userService.createUser(email, name, username);

        if(!payload.payload) {
            console.log('User register has failed!');
            res.status(409).json({ error: payload.message });
            return;
        }

        console.log('Payload: ', payload);
        res.status(201).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const listAllUsers = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> listUsers');
    const payload = await userService.listAllUsers();

    if(!payload) {
        console.log('An error has occured during the proccess!');
        res.status(502).json({ error: 'Bad Gateway' });
        return;
    }
    console.log('Payload: ', payload);
    res.status(200).json(payload);
});

const getUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> getUserById');
    const { id } = req.params;

    try {
        const payload = await userService.getUserById(id);

        if(!payload.payload) {
            console.log(payload.message);
            res.status(payload.response).json({ error: payload.message });
            return;
        }

        console.log('Payload to be sent: ', payload);
        res.status(payload.response).json(payload);
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const updateUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> updateUserById');
    const { id } = req.params;
    const { bio, name, image } = req.body;

    try {
        const payload = await userService.updateUserById(id, name, image, bio);

        if(!payload) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            res.status(404).json({ error: Logger.LOG_USER_NOT_FOUND });
            return;
        }

        console.log('User information has been updated successfully');
        res.status(200).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const deleteUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> deleteUserById');
    const { id } = req.params;

    try {
        const response = await userService.deleteUserById(id);

        if(response.response != 204) {
            console.log(response.message);
            res.status(response.response).json({ error: response.message });
            return;
        }
        console.log('User has been deleted successfuly');

        const deletedAt = new Date();
        res.set({
            'X-Deleted-At': deletedAt.toISOString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        
        res.status(204).end();
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
});

export {
    createUser,
    listAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
};