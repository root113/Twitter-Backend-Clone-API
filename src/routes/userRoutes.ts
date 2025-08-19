import { Router } from 'express';
import {
    createUser,
    listAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/userController';
import validate from '../middlewares/validate';
import { CreateUserBodyDto, UpdateUserBodyDto } from '../dtos/user.dto';
import { IdParamDto } from '../dtos/validation.dto';

const router = Router();

router.route('/')
    .get(listAllUsers)
    .post(validate({ body: CreateUserBodyDto }) ,createUser);

router.route('/:id')
    .get(validate({ params: IdParamDto }), getUserById)
    .put(validate({ params: IdParamDto, body: UpdateUserBodyDto }), updateUserById)
    .delete(validate({ params: IdParamDto }), deleteUserById);

export default router;
