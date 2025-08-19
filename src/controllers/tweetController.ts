import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import { Logger } from '../utils/Logger';
import { TweetService } from '../services/tweetService';
import type { CreateTweetBodyDto, UpdateTweetBodyDto } from '../dtos/tweet.dto';

const tweetService = new TweetService();

const createTweet = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> createTweet');
    const body = req.body as CreateTweetBodyDto;

    const response = await tweetService.createTweet(body.content, body.userId, body.image === undefined ? null : body.image);
    res.status(201).json({ payload: response.payload, message: response.message });
});

const listAllTweets = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> listTweets');
    const { userId } = req.query as { userId: string };

    const response = await tweetService.listAllUserTweets(userId);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const getTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> getTweetById');
    const { id } = req.params as { id: string };

    const response = await tweetService.getTweetById(id);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const updateTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> updateTweetById');
    const { id } = req.params as { id: string };
    const body = req.body as UpdateTweetBodyDto;
    
    const response = await tweetService.updateTweetById(id, body.content, body.image);
    res.status(200).json({ payload: response.payload, message: response.message });
});

const deleteTweetById = asyncHandler(async (req: Request, res: Response) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> deleteTweetById');
    const { id } = req.params as { id: string };
    
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
