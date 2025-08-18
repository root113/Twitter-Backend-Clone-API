import { PrismaClient, Tweet, User } from "../generated/prisma";
import HttpError from '../errors/HttpError';
import { Logger } from "../utils/Logger";

const prisma = new PrismaClient();

function validateTypes(
    value_id: unknown,
    value_1?: unknown,
    value_2?: unknown
): { valid: boolean; message: string } {
    console.log('Validating types...');

    if(typeof value_id !== 'string' ) {
        return { valid: false, message: 'Tweet ID must be a string!' }
    }

    if(value_1 !== undefined && typeof value_1 !== 'string' ) {
        return { valid: false, message: 'Content must be a string!' }
    }

    if(value_2 !== undefined && typeof value_2 !== 'string' ) {
        return { valid: false, message: 'Image must be a string!' }
    }

    return { valid: true, message: 'Validation successful' };
}

function isUser(user: User | null | undefined) {
    console.log('Checking DB entities if user exists with the id provided...');

    if(!user) {
        console.log(Logger.LOG_USER_NOT_FOUND);
        return false;
    }
    console.log(Logger.LOG_USER_FOUND);
    return true;
}

function isTweet(tweet: Tweet | null | undefined) {
    console.log('Checking DB entities if tweet exists with the id provided...');

    if(!tweet) {
        console.log(Logger.LOG_TWEET_NOT_FOUND);
        return false;
    }
    console.log(Logger.LOG_TWEET_FOUND);
    return true;
}

export class TweetService {
    async createTweet(
        content: string, 
        image: string, 
        userId: string
    ): Promise<{ payload: any, message: string }>
    {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> createTweet');
        
        const validation = validateTypes(userId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const tweetOwner = await prisma.user.findUnique({ where: { id: userId } });
        
            if(!isUser(tweetOwner)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            const newTweet = await prisma.tweet.create({
                data: { content, image, userId }
            });
            console.log('Tweet has been created successfuly');

            const payload = {
                content: newTweet.content,
                image: newTweet.image,
                impression: newTweet.impression
            };

            return {
                payload,
                message: 'Tweet has been created successfuly'
            };
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            console.log('Database error while creating tweet', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }

    async listAllUserTweets(userId: any): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> listAllTweets');

        const validation = validateTypes(userId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const tweetsOwner = await prisma.user.findUnique({ where: { id: userId } });
        
            if(!isUser(tweetsOwner)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_USER_FOUND);
            }

            const allTweets = await prisma.tweet.findMany({ where: { userId: tweetsOwner!.id } });
            
            const payload = allTweets.map(tweet => ({
                content: tweet.content,
                image: tweet.image,
                impression: tweet.impression
            }));
            
            return { payload, message: 'Operation successful' };
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_USER_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_USER_NOT_FOUND);
            }

            console.log('Database error while retrieving tweets', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
    
    async getTweetById(tweetId: any): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> getTweetById');

        const validation = validateTypes(tweetId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const getTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
            
            if(!isTweet(getTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            const payload = {
                content: getTweet?.content,
                image: getTweet?.image,
                impression: getTweet?.impression
            };

            return {
                payload,
                message: 'Successfuly retrieved tweet'
            };
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_TWEET_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            console.log('Database error while retrieving tweet', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
    
    async updateTweetById(
        tweetId: any, 
        content?: any, 
        image?: any
    ): Promise<{ payload: any, message: string }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> updateTweetById');

        const validation = validateTypes(tweetId, content, image);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        const data: Record<string, any> = {
            ...(content !== undefined && { content }),
            ...(image !== undefined && { image })
        };

        try {
            const getTweet = await prisma.tweet.update({ 
                where: { id: tweetId }, 
                data
            });

            if(!isTweet(getTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            const payload = {
                content: getTweet.content,
                image: getTweet.image,
                impression: getTweet.impression
            };
            return {
                payload,
                message: 'Tweet has been updated successfuly'
            };
        } catch(err: any) {
            // Prisma throws known request error with code 'P2025'/'P2023' when record to update/delete not found
            if (err.code === 'P2023') {
                console.log(Logger.LOG_TWEET_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            console.log('Database error while updating tweet', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
    
    async deleteTweetById(tweetId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> deleteTweetById');

        const validation = validateTypes(tweetId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            throw new HttpError(400, validation.message);
        }

        try {
            const deleteTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
            
            if(!isTweet(deleteTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            await prisma.tweet.delete({ where: { id: tweetId } });
            console.log('Tweet has been deleted successfuly');
        } catch(err: any) {
            if (err.code === 'P2023') {
                console.log(Logger.LOG_TWEET_NOT_FOUND + ' (Prisma P2023)');
                throw new HttpError(404, Logger.LOG_TWEET_NOT_FOUND);
            }

            console.log('Database error while deleting tweet', err);
            throw new HttpError(500, 'An error has occured during the proccess!');
        }
    }
}
