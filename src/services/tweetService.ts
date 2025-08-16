import { PrismaClient, Tweet, User } from "../generated/prisma";
import { Logger } from "../utils/Logger";

const prisma = new PrismaClient();

function isMultiTypecheck(value_1: any, value_2?: any, value_3?: any) {
    console.log('Typechecking the value(s)...');

    if(
        typeof value_1 === 'string' || 
        typeof value_2 === 'string' ||
        typeof value_3 === 'string'
    ) {
        console.log('Typecheck successful');
        return true;
    }
    console.log('Typecheck failed');
    return false;
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
    async createTweet(content: string, image: string, userId: string) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> createTweet');
        
        const tweetOwner = await prisma.user.findUnique({ where: { id: userId } });
        
        if(!isMultiTypecheck(content, image, userId)) {
            console.log('Invalid parameters');
            return;
        }
        
        if(!isUser(tweetOwner)) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            return null;
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
        return payload;
    }

    async listAllUserTweets(userId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> listAllTweets');

        if(!isMultiTypecheck(userId)) {
            console.log('Invalid user ID!');
            return;
        }

        const tweetsOwner = await prisma.user.findUnique({ where: { id: userId } });
        if(!isUser(tweetsOwner)) {
            console.log(Logger.LOG_USER_NOT_FOUND);
            return null;
        }

        const allTweets = await prisma.tweet.findMany({ where: { userId: tweetsOwner!.id } });
        const payload = allTweets.map(tweet => ({
            content: tweet.content,
            image: tweet.image,
            impression: tweet.impression
        }));
        return payload;
    }
    
    async getTweetById(tweetId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> getTweetById');

        if(!isMultiTypecheck(tweetId)) {
            console.log('Invalid tweet ID!');
            return;
        }

        const getTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
        if(!isTweet(getTweet)) {
            console.log(Logger.LOG_TWEET_NOT_FOUND);
            return;
        }

        const payload = {
            content: getTweet?.content,
            image: getTweet?.image,
            impression: getTweet?.impression
        };
        return payload;
    }
    
    async updateTweetById(tweetId: any, content?: any, image?: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> updateTweetById');

        if(!isMultiTypecheck(tweetId, content, image)) {
            console.log('Invalid parameters!');
            return;
        }

        const getTweet = await prisma.tweet.update({ 
            where: { id: tweetId }, 
            data: { content, image }
        });

        if(!isTweet(getTweet)) {
            console.log(Logger.LOG_TWEET_NOT_FOUND);
            return null;
        }

        const payload = {
            content: getTweet.content,
            image: getTweet.image,
            impression: getTweet.impression
        };
        return payload;
    }
    
    async deleteTweetById(tweetId: any) {
        console.log(Logger.LOG_NVG + Logger.LOG_SERVICE + 'Tweet -> deleteTweetById');

        if(!isMultiTypecheck(tweetId)) {
            console.log('Invalid tweet ID!');
            return;
        }

        const deleteTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
        if(!isTweet(deleteTweet)) {
            console.log(Logger.LOG_TWEET_NOT_FOUND);
            return null;
        }

        return await prisma.tweet.delete({ where: { id: tweetId } });
    }
}
