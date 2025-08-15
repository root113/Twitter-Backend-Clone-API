import asyncHandler from 'express-async-handler';
import { Logger } from '../utils/Logger';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const createUser = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> createUser');
    const { email, name, username } = req.body;
    console.log('Request body params: ', email, name, username);

    try {
        const insertUser = await prisma.user.create({
            data: { email, name, username }
        });

        console.log('User has been created successfuly');
        const payload = {
            email: insertUser.email,
            name: insertUser.name,
            username: insertUser.username,
            image: insertUser.image,
            bio: insertUser.bio
        };
        res.status(201).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const listUsers = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> listUsers');
    const allUsers = await prisma.user.findMany();
    const payloadUsers = allUsers.map(user => ({
        email: user.email,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio
    }));
    res.status(200).json(payloadUsers);
});

const getUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> getUserById');
    const { id } = req.params;

    if(typeof id !== 'string') {
        console.log(Logger.LOG_TYPECHECK_FAIL);
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }

    try {
        const responseUser = await prisma.user.findUnique({ where: { id: id } });

        if(!responseUser) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            res.status(404).json({ error: Logger.LOG_USER_NOT_FOUND });
            return;
        }

        const payload = {
            email: responseUser.email,
            name: responseUser.name,
            username: responseUser.username,
            image: responseUser.image,
            bio: responseUser.bio
        };
        console.log('Payload to be sent: ', payload);
        res.status(200).json(payload);
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const updateUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> updateUserById');
    const { id } = req.params;
    const { bio, name, image } = req.body;
    
    if(typeof id !== 'string') {
        console.log(Logger.LOG_TYPECHECK_FAIL);
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }

    try {
        const responseUser = await prisma.user.update({
            where: { id: id },
            data: { bio, name, image }
        });

        if(!responseUser) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            res.status(404).json({ error: Logger.LOG_USER_NOT_FOUND });
            return;
        }

        console.log('User information has been updated successfully');
        const payload = {
            email: responseUser.email,
            name: responseUser.name,
            username: responseUser.username,
            image: responseUser.image,
            bio: responseUser.bio
        };
        res.status(200).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const deleteUserById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'User -> deleteUserById');
    const { id } = req.params;

    if(typeof id !== 'string') {
        console.log(Logger.LOG_TYPECHECK_FAIL);
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }

    try {
        const userToBeDeleted = await prisma.user.findUnique({ where: { id: id }} );

        if(!userToBeDeleted) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            res.status(404).json({ error: Logger.LOG_USER_NOT_FOUND });
            return;
        }

        // explicit void statement just in case if
        // express-async-handler tries to set a retun value
        // which is strictly forbidden in 204-No Content headers
        void await prisma.user.delete({ where: { id: id } });
        console.log('User has been deleted successfuly');

        const deletedAt = new Date();
        res.set({
            'Content-Location': `/user/${userToBeDeleted.id}`,
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
    listUsers,
    getUserById,
    updateUserById,
    deleteUserById
};