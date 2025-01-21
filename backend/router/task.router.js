import express from "express";
import {
  createTask,
  getUserTasks,
  getTaskById,
  updateTaskStatus,
  addTaskComment,
  deleteTask,
  deleteTaskComment,
} from "../controllers/task.controllers.js";
import { auth } from "../middleware/auth.middleware.js";
import Task from "../models/tasks.models.js";
import Notification from "../models/notification.models.js";

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Cập nhật thông tin task
router.put("/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const updates = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Kiểm tra quyền cập nhật
    if (
      task.createdBy.toString() !== userId.toString() &&
      !task.assignedTo.some((id) => id.toString() === userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task",
      });
    }

    // Kiểm tra nếu người cập nhật là leader (người tạo task)
    if (task.createdBy.toString() === userId.toString()) {
      const changedFields = [];
      
      // Kiểm tra các trường thay đổi
      if (updates.title && updates.title !== task.title) changedFields.push('title');
      if (updates.description && updates.description !== task.description) changedFields.push('description');
      if (updates.priority && updates.priority !== task.priority) changedFields.push('priority');
      if (updates.dueDate && updates.dueDate !== task.dueDate) changedFields.push('due date');
      
      // Nếu có thay đổi và không phải chỉ là thay đổi trạng thái
      if (changedFields.length > 0 && !(changedFields.length === 1 && updates.status !== task.status)) {
        // Tạo thông báo cho tất cả người được gán
        const notificationRecipients = task.assignedTo.filter(
          id => id.toString() !== userId.toString()
        );

        await Promise.all(notificationRecipients.map(recipientId => {
          const fieldsChanged = changedFields.join(', ');
          return Notification.create({
            type: 'TASK_UPDATE',
            title: `Task "${task.title}" Updated`,
            message: `${req.user.username} has updated the following task details: ${fieldsChanged}`,
            sender: userId,
            recipient: recipientId,
            relatedTask: taskId
          });
        }));
      }
    }

    // Nếu trạng thái thay đổi, tạo thông báo cho người được gán và người tạo task
    if (updates.status && updates.status !== task.status) {
      const notificationRecipients = [...task.assignedTo];
      if (!notificationRecipients.includes(task.createdBy)) {
        notificationRecipients.push(task.createdBy);
      }

      // Loại bỏ người thay đổi trạng thái khỏi danh sách nhận thông báo
      const filteredRecipients = notificationRecipients.filter(
        id => id.toString() !== userId.toString()
      );

      // Tạo thông báo cho từng người nhận
      await Promise.all(filteredRecipients.map(recipientId => {
        return Notification.create({
          type: 'TASK_STATUS_UPDATED',
          title: `Task "${task.title}" Status Changed`,
          message: `${req.user.username} has changed the task status from "${task.status}" to "${updates.status}"`,
          sender: userId,
          recipient: recipientId,
          relatedTask: taskId
        });
      }));
    }

    // Cập nhật task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updates },
      { new: true }
    ).populate("createdBy assignedTo", "username avatarUrl");

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Error updating task",
    });
  }
});

// Lấy danh sách task của user
router.get("/user-tasks", getUserTasks);

// Lấy chi tiết task theo ID
router.get("/:taskId", getTaskById);

// Tạo task mới với thông tin từ request body
router.post("/create", createTask);

// Cập nhật trạng thái của task
router.patch("/:taskId/status", updateTaskStatus);

// Thêm comment mới vào task
router.post("/:taskId/comment", addTaskComment);

// Xóa task
router.delete("/:taskId", deleteTask);

// Xóa comment khỏi task
router.delete("/:taskId/comment/:commentId", deleteTaskComment);

export default router;
