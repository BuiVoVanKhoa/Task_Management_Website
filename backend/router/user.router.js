import express from 'express';
import {
  initiateSignup,
  verifyAndCompleteSignup,
  login,
  logout,
  verifyAuth,
  updateProfile
} from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Đăng ký và xác thực email
router.post('/initiate-signup', initiateSignup);
router.post('/complete-signup', verifyAndCompleteSignup);

// Đăng nhập và đăng xuất
router.post('/login', login);
router.post('/logout', logout);

// Kiểm tra trạng thái đăng nhập
router.get('/verify', verifyAuth);

// Cập nhật thông tin người dùng
router.put('/update-profile', auth, updateProfile);

export default router;