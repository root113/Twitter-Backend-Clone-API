import { Router } from 'express';
import {
    createTweet,
    listAllTweets,
    getTweetById,
    updateTweetById,
    deleteTweetById
} from '../controllers/tweetController';
import validate from '../middlewares/validate';
import {
    CreateTweetBodyDto,
    ListUserTweetsQueryDto,
    UpdateTweetBodyDto
} from '../dtos/tweet.dto';
import { IdParamDto } from '../dtos/validation.dto';

const router = Router();

router.route('/')
    .get(validate({ query: ListUserTweetsQueryDto }), listAllTweets)
    .post(validate({ body: CreateTweetBodyDto }) ,createTweet);

router.route('/:id')
    .get(validate({ params: IdParamDto }), getTweetById)
    .put(validate({ params: IdParamDto, body: UpdateTweetBodyDto }), updateTweetById)
    .delete(validate({ params: IdParamDto }), deleteTweetById);

export default router;
