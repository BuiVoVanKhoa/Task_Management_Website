/**
 * Router cho Task Management
 * Định nghĩa các endpoints liên quan đến tasks
 */

import express from 'express';
import { 
    createTask,      // Tạo task mới
    getUserTasks,    // Lấy danh sách task của user
    getTaskById,     // Lấy task của user theo Idtask
    updateTaskStatus,// Cập nhật trạng thái task
    addTaskComment,  // Thêm comment vào task
    deleteTask,      // Xóa task
    deleteTaskComment // Xóa comment
} from '../controllers/task.controllers.js';
import { auth } from '../middleware/auth.middleware.js';
import Task from '../models/tasks.models.js';

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

/**
 * PUT /api/tasks/:taskId
 * Cập nhật thông tin task
 */
router.put("/:taskId", async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const updates = req.body;
        const userId = req.user._id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Kiểm tra quyền cập nhật
        if (task.createdBy.toString() !== userId.toString() && 
            !task.assignedTo.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to update this task"
            });
        }

        // Cập nhật task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: updates },
            { new: true }
        ).populate('createdBy assignedTo', 'username avatarUrl');

        res.json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: "Error updating task"
        });
    }
});

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
 * GET /api/:taskId
 * Lấy tasks của user theo IdTask
 */
router.get("/:id", getTaskById);

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
 * Xóa task
 */
router.delete("/:taskId", deleteTask);

/**
 * DELETE /api/tasks/:taskId/comment/:commentId
 * Xóa comment khỏi task
 */
router.delete("/:taskId/comment/:commentId", deleteTaskComment);

export default router;
