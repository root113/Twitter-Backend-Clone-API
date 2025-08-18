import asyncHandler from 'express-async-handler';
import { Logger } from '../utils/Logger';
import { TweetService } from '../services/tweetService';

const tweetService = new TweetService();

const createTweet = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> createTweet');
    const { content, image, userId } = req.body;

    try {
        const payload = await tweetService.createTweet(content, image, userId);
        
        if(!payload.payload) {
            console.log(payload.message);
            res.status(payload.response).json({ error: Logger.LOG_USER_NOT_FOUND });
            return;
        }

        console.log('Payload: ', payload);
        res.status(201).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const listAllTweets = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> listTweets');
    const { id } = req.body;

    try {
        const payload = await tweetService.listAllUserTweets(id);
        
        if(!payload.payload) {
            console.log(payload.message);
            res.status(payload.response).json({ error: payload.message });
            return;
        }

        res.status(200).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const getTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> getTweetById');
    const { id } = req.params;

    try {
        const payload = await tweetService.getTweetById(id);
        
        if(!payload.payload) {
            console.log(payload.message);
            res.status(payload.response).json({ error: payload.message });
            return;
        }

        res.status(200).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const updateTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> updateTweetById');
    const { id } = req.params;
    const { content, image } = req.body;
    
    try {
        const payload = await tweetService.updateTweetById(id, content, image);
        
        if(!payload.payload) {
            console.log(payload.message);
            res.status(payload.response).json({ error: payload.message });
            return;
        }

        res.status(200).json(payload);
    } catch(err) {
        console.error('Database error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const deleteTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> deleteTweetById');
    const { id } = req.params;
    
    try {
        const response = await tweetService.deleteTweetById(id);

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
    createTweet,
    listAllTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
};