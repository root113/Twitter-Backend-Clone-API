import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import { Logger } from '../utils/Logger';
import { TweetService } from '../services/tweetService';

const tweetService = new TweetService();

const createTweet = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> createTweet');
    const { content, image, userId } = req.body;

    const response = await tweetService.createTweet(content, image, userId);
    res.status(201).json({ payload: response.payload, message: response.message });
});

const listAllTweets = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> listTweets');
    const { id } = req.body;

    const response = await tweetService.listAllUserTweets(id);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const getTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> getTweetById');
    const { id } = req.params;

    const response = await tweetService.getTweetById(id);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const updateTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> updateTweetById');
    const { id } = req.params;
    const { content, image } = req.body;
    
    const response = await tweetService.updateTweetById(id, content, image);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const deleteTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> deleteTweetById');
    const { id } = req.params;
    
    await tweetService.deleteTweetById(id);

    const deletedAt = new Date();
    res.set({
        'X-Deleted-At': deletedAt.toISOString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    }).status(204).end();
});

export {
    createTweet,
    listAllTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
};