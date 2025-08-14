import { Router } from 'express';
import {
    createTweet,
    listTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
} from '../controllers/tweetController';

const router = Router();

router.route('/').get(listTweets).post(createTweet);
router.route('/:id')
    .get(getTweetById)
    .put(updateTweetById)
    .delete(deleteTweetById);

export default router;
