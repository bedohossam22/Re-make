import express from 'express';
import { register, login, getUsers } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators/authValidator';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/users', auth, getUsers);

export default router;
