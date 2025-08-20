import express from 'express';
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use('/user', userRoutes);
app.use('/tweet', tweetRoutes);
app.use(errorHandler);

export default app;
