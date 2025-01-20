import Task from "../models/tasks.models.js";
import { createNotification } from './notification.controllers.js';

/**
 * Tạo task mới
 * @param {string} title - Tiêu đề task
 * @param {string} description - Mô tả task
 * @param {Date} dueDate - Ngày hết hạn
 * @param {string} priority - Độ ưu tiên
 * @param {string} status - Trạng thái
 * @param {string} assignedTo - Người được giao task
 */

export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            dueDate,
            status,
            priority,
            assignedTo,
            attachments,
            teamId,
        } = req.body;

        const createdBy = req.user._id;

        // Xác thực các trường bắt buộc
        if (!title || !description || !dueDate || !teamId) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields",
            });
        }

        // Đảm bảo assignedTo là một mảng và không rỗng
        if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one user must be assigned to the task",
            });
        }

        // Xác thực tệp đính kèm
        if (attachments && !Array.isArray(attachments)) {
            return res.status(400).json({
                success: false,
                message: "Attachments must be an array",
            });
        }

        // Tạo task mới
        const newTask = new Task({
            title,
            description,
            dueDate,
            status: status || "todo",
            priority: priority || "medium",
            assignedTo,
            attachments: attachments || [],
            createdBy,
            teamId,
        });

        await newTask.save();

        // Điền thông tin người dùng
        const populatedTask = await Task.findById(newTask._id)
            .populate("assignedTo", "username avatarUrl")
            .populate("createdBy", "username")
            .populate("teamId", "name");

        // Tạo thông báo cho tất cả người được giao task
        const notifications = assignedTo.map(userId => ({
            recipientId: userId,
            senderId: createdBy,
            teamId: teamId,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assignment',
            message: `You have been assigned to task "${title}"`
        }));

        await Promise.all(notifications.map(notification => 
            createNotification(notification)
        ));

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: populatedTask,
        });
    } catch (error) {
        console.error("Error in createTask:", error);
        res.status(500).json({
            success: false,
            message: "Error creating task",
            error: error.message,
        });
    }
};

/**
 * Lấy danh sách task của user
 * @route GET /api/tasks/user-tasks
 * Trả về tất cả tasks mà user được assign hoặc đã tạo
 */
export const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
        })
            .populate("assignedTo", "username avatarUrl")
            .populate("createdBy", "username")
            .populate("teamId", "name");

        res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy task của user theo IdTask
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm task và populate đầy đủ thông tin cần thiết
        const task = await Task.findById(id)
            .populate("assignedTo", "username avatarUrl _id")
            .populate("createdBy", "username _id")
            .populate("teamId", "name members")
            .populate({
                path: "comments.createdBy",
                select: "username avatar _id",
            });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Kiểm tra quyền truy cập
        const isCreator = task.createdBy._id.toString() === req.user._id.toString();
        const isAssigned = task.assignedTo.some(
            (user) => user._id.toString() === req.user._id.toString()
        );
        const isInTeam =
            task.teamId &&
            task.teamId.members.some(
                (memberId) => memberId.toString() === req.user._id.toString()
            );

        // Cho phép xem nếu là người tạo, người được assign hoặc thành viên team
        if (!isCreator && !isAssigned && !isInTeam) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this task",
            });
        }

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error("Error in getTaskById:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Cập nhật trạng thái task
 * @route PATCH /api/tasks/:taskId/status
 * @param {string} status - Trạng thái mới (todo/inprogress/completed)
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        const task = await Task.findById(taskId)
            .populate('createdBy', 'username')
            .populate('assignedTo', 'username');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Kiểm tra quyền cập nhật
        const isAssigned = task.assignedTo.some(user => 
            user._id.toString() === userId.toString()
        );

        if (!isAssigned && task.createdBy._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this task",
            });
        }

        const oldStatus = task.status;
        task.status = status;
        await task.save();

        // Tạo thông báo cho người tạo task nếu người cập nhật không phải là người tạo
        if (task.createdBy._id.toString() !== userId.toString()) {
            await createNotification({
                recipientId: task.createdBy._id,
                senderId: userId,
                teamId: task.teamId,
                type: 'TASK_STATUS_UPDATED',
                title: 'Task Status Updated',
                message: `Task "${task.title}" status has been updated from ${oldStatus} to ${status}`
            });
        }

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Thêm comment vào task
 * @route POST /api/tasks/:taskId/comment
 * @param {string} text - Nội dung comment
 */
export const addTaskComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }

        // Find task and add comment
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Add new comment
        task.comments.push({
            text,
            createdBy: userId
        });

        await task.save();

        // Populate comment author info
        const populatedTask = await Task.findById(taskId)
            .populate('comments.createdBy', 'username avatar')
            .populate('assignedTo', 'username')
            .populate('createdBy', 'username');

        // Tạo danh sách người nhận thông báo (người được gán và người tạo task)
        const notificationRecipients = [...task.assignedTo];
        if (!notificationRecipients.includes(task.createdBy)) {
            notificationRecipients.push(task.createdBy);
        }

        // Loại bỏ người comment khỏi danh sách nhận thông báo
        const filteredRecipients = notificationRecipients.filter(
            id => id.toString() !== userId.toString()
        );

        // Tạo thông báo cho từng người nhận
        await Promise.all(filteredRecipients.map(recipientId => {
            return createNotification({
                recipientId: recipientId,
                senderId: userId,
                type: 'TASK_COMMENT',
                title: `New Comment on Task "${task.title}"`,
                message: `${req.user.username} commented: "${text.length > 50 ? text.substring(0, 47) + '...' : text}"`,
                relatedTask: taskId
            });
        }));

        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            task: populatedTask
        });
    } catch (error) {
        console.error("Error in addTaskComment:", error);
        res.status(500).json({
            success: false,
            message: "Error adding comment",
            error: error.message
        });
    }
};

/**
 * Xóa comment của task
 * @route DELETE /api/tasks/:taskId/comment/:commentId
 * Chỉ người tạo comment mới có quyền xóa
 */
export const deleteTaskComment = async (req, res) => {
    try {
        const { taskId, commentId } = req.params;
        const userId = req.user._id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Tìm comment cần xóa
        const comment = task.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        // Kiểm tra xem người dùng hiện tại có phải là người tạo comment không
        if (comment.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this comment",
            });
        }

        // Xóa comment
        task.comments.pull(commentId);
        await task.save();

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteTaskComment:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * Xóa task
 * @route DELETE /api/tasks/:taskId
 * Chỉ người tạo task mới có quyền xóa
 */
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Chỉ người tạo mới có thể xóa
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this task",
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
