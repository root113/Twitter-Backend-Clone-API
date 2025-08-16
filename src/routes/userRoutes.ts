import { Router } from 'express';
import {
    createUser,
    listAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} from '../controllers/userController';

const router = Router();

router.route('/').get(listAllUsers).post(createUser);
router.route('/:id')
    .get(getUserById)
    .put(updateUserById)
    .delete(deleteUserById);

export default router;
