import { Router } from 'express';
import {
    createUser,
    listUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/userController';

const router = Router();

router.route('/').get(listUsers).post(createUser);
router.route('/:id')
    .get(getUserById)
    .put(updateUserById)
    .delete(deleteUserById);

export default router;
