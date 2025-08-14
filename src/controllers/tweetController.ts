import asyncHandler from 'express-async-handler';
import { Logger } from '../utils/Logger';

const createTweet = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> createTweet');
    res.status(501).json({ error: 'Not Implemented' });
});

const listTweets = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> listTweets');
    res.status(501).json({ error: 'Not Implemented' });
});

const getTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> getTweetById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

const updateTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> updateTweetById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

const deleteTweetById = asyncHandler(async (req, res) => {
    console.log(Logger.LOG_NVG + Logger.LOG_CONTROLLER + 'Tweet -> deleteTweetById');
    const { id } = req.params;
    res.status(501).json({ error: `Not Implemented: ${id}` });
});

export {
    createTweet,
    listTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
};