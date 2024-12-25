import express from 'express';
import { login, logout, signup, verifyToken } from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify',auth , verifyToken);

export default router;