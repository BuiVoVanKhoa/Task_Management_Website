import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../controllers/notification.controllers.js';

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Lấy danh sách thông báo của người dùng
router.get('/', getUserNotifications);

// Đánh dấu thông báo đã đọc
router.put('/:notificationId/read', markNotificationAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.put('/read-all', markAllNotificationsAsRead);

// Xóa thông báo
router.delete('/:notificationId', deleteNotification);

export default router;
