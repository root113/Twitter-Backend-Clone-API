import asyncHandler from 'express-async-handler';
import { Logger } from '../utils/Logger';

const createUser = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> createUser');
    res.status(501).json({ error: 'Not Implemented' });
});

const listUsers = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> listUsers');
    res.status(501).json({ error: 'Not Implemented' });
});

const getUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> getUserById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

const updateUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> updateUserById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

const deleteUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> deleteUserById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

export {
    createUser,
    listUsers,
    getUserById,
    updateUserById,
    deleteUserById
};