import { Router } from 'express';
import {
    createTweet,
    listAllTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
} from '../controllers/tweetController';

const router = Router();

router.route('/').get(listAllTweets).post(createTweet);
router.route('/:id')
    .get(getTweetById)
    .put(updateTweetById)
    .delete(deleteTweetById);

export default router;
