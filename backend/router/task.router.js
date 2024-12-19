/**
 * Router cho Task Management
 * Định nghĩa các endpoints liên quan đến tasks
 */

import express from 'express';
import { 
    createTask,      // Tạo task mới
    getUserTasks,    // Lấy danh sách task của user
    updateTaskStatus,// Cập nhật trạng thái task
    addTaskComment,  // Thêm comment vào task
    deleteTask       // Xóa task
} from '../controllers/task.controllers.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả routes
router.use(protectRoute);

/**
 * POST /api/tasks/create
 * Tạo task mới với thông tin từ request body
 */
router.post("/create", createTask);

/**
 * GET /api/tasks/user-tasks
 * Lấy tất cả tasks của user hiện tại
 */
router.get("/user-tasks", getUserTasks);

/**
 * PATCH /api/tasks/:taskId/status
 * Cập nhật trạng thái của task
 */
router.patch("/:taskId/status", updateTaskStatus);

/**
 * POST /api/tasks/:taskId/comment
 * Thêm comment mới vào task
 */
router.post("/:taskId/comment", addTaskComment);

/**
 * DELETE /api/tasks/:taskId
 * Xóa task (chỉ người tạo mới có quyền)
 */
router.delete("/:taskId", deleteTask);

export default router;
