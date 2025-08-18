import { PrismaClient, Tweet, User } from "../generated/prisma";
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
    ): Promise<{ payload: any, message: string, response: number }>
    {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> createTweet');
        
        const validation = validateTypes(userId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            return { payload: null, message: validation.message, response: 400 };
        }

        try {
            const tweetOwner = await prisma.user.findUnique({ where: { id: userId } });
        
            if(!isUser(tweetOwner)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                return {
                    payload: null,
                    message: Logger.LOG_USER_NOT_FOUND,
                    response: 404
                };
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
                payload: payload,
                message: 'Tweet has been created successfuly',
                response: 201
            };
        } catch(err) {
            console.error('Database error: ', err);
            return {
                payload: null,
                message: 'An error has occured during the proccess!',
                response: 500
            };
        }
    }

    async listAllUserTweets(userId: any): Promise<{ payload: any, message: string, response: number }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> listAllTweets');

        const validation = validateTypes(userId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            return { payload: null, message: validation.message, response: 400 };
        }

        try {
            const tweetsOwner = await prisma.user.findUnique({ where: { id: userId } });
        
            if(!isUser(tweetsOwner)) {
                console.log(Logger.LOG_USER_NOT_FOUND);
                return { payload: null, message: Logger.LOG_USER_NOT_FOUND, response: 404 };
            }

            const allTweets = await prisma.tweet.findMany({ where: { userId: tweetsOwner!.id } });
            
            const payload = allTweets.map(tweet => ({
                content: tweet.content,
                image: tweet.image,
                impression: tweet.impression
            }));
            
            return { payload: payload, message: 'Operation successful', response: 200 };
        } catch(err) {
            console.error('Database error: ', err);
            return { payload: null, message: 'An error has occured during the proccess!', response: 500 };
        }
    }
    
    async getTweetById(tweetId: any): Promise<{ payload: any, message: string, response: number }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> getTweetById');

        const validation = validateTypes(tweetId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            return { payload: null, message: validation.message, response: 400 };
        }

        try {
            const getTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
            
            if(!isTweet(getTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                return { 
                    payload: null, 
                    message: Logger.LOG_TWEET_NOT_FOUND, 
                    response: 404
                };
            }

            const payload = {
                content: getTweet?.content,
                image: getTweet?.image,
                impression: getTweet?.impression
            };

            return {
                payload: payload,
                message: 'Successfuly retrieved user tweets',
                response: 200
            };
        } catch(err) {
            console.error('Database error: ', err);
            return { payload: null, message: 'An error has occured during the proccess!', response: 500 };
        }
    }
    
    async updateTweetById(
        tweetId: any, 
        content?: any, 
        image?: any
    ): Promise<{ payload: any, message: string, response: number }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> updateTweetById');

        const validation = validateTypes(tweetId, content, image);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            return { payload: null, message: validation.message, response: 400 };
        }

        try {
            const getTweet = await prisma.tweet.update({ 
                where: { id: tweetId }, 
                data: { content, image }
            });

            if(!isTweet(getTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                return { 
                    payload: null, 
                    message: Logger.LOG_TWEET_NOT_FOUND, 
                    response: 404 
                };
            }

            const payload = {
                content: getTweet.content,
                image: getTweet.image,
                impression: getTweet.impression
            };
            return {
                payload: payload,
                message: 'Tweet has been updated successfuly',
                response: 200
            };
        } catch(err) {
            console.error('Database error: ', err);
            return { payload: null, message: 'An error has occured during the proccess!', response: 500 };
        }
    }
    
    async deleteTweetById(tweetId: any): Promise<{ message: string, response: number }> {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> deleteTweetById');

        const validation = validateTypes(tweetId);
        
        if(!validation.valid) {
            console.log('Invalid parameters: ', validation.message);
            return { message: validation.message, response: 400 };
        }

        try {
            const deleteTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
            
            if(!isTweet(deleteTweet)) {
                console.log(Logger.LOG_TWEET_NOT_FOUND);
                return { message: Logger.LOG_TWEET_NOT_FOUND, response: 404 };
            }

            await prisma.tweet.delete({ where: { id: tweetId } });
            console.log('Tweet has been deleted successfuly');
            return { message: 'Successfuly deleted user entity', response: 204 };
        } catch(err) {
            console.error('Database error: ', err);
            return { message: 'An error has occured during the proccess!', response: 500 };
        }
    }
}
