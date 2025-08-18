import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import errorHandler from './middlewares/errorHandler';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/user', userRoutes);
app.use('/tweet', tweetRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server is listening on port: ', PORT);
});
