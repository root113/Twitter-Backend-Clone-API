import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import { Logger } from '../utils/Logger';
import { UserService } from '../services/userService';
import { CreateUserBodyDto, UpdateUserBodyDto } from '../dtos/user.dto';

const userService = new UserService();

const createUser = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> createUser');
    const body = req.body as CreateUserBodyDto;
    
    const response = await userService.createUser(body.email, body.name, body.username);
    res.status(201).json({ payload: response.payload, message: response.message });
});

const listAllUsers = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> listUsers');
    const response = await userService.listAllUsers();
    res.status(200).json({ payload: response.payload, message: response.message });
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> getUserById');
    const { id } = req.params as { id: string };

    const response = await userService.getUserById(id);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const updateUserById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> updateUserById');
    const { id } = req.params as { id: string };
    const body = req.body as UpdateUserBodyDto;

    const response = await userService.updateUserById(id, body.name, body.image, body.bio);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const deleteUserById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> deleteUserById');
    const { id } = req.params as { id: string };

    await userService.deleteUserById(id);        
    const deletedAt = new Date();
    res.set({
        'X-Deleted-At': deletedAt.toISOString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    }).status(204).end();
});

export {
    createUser,
    listAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
};
