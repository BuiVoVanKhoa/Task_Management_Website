/**
 * Controllers cho Task Management
 * Xử lý tất cả các thao tác liên quan đến tasks
 */

import Task from '../models/tasks.models.js';

/**
 * Tạo task mới
 * @route POST /api/tasks/create
 * @param {string} title - Tiêu đề task
 * @param {string} description - Mô tả task
 * @param {Date} dueDate - Ngày hết hạn
 * @param {string} priority - Độ ưu tiên (low/medium/high)
 * @param {string} teamId - ID của team (optional)
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, teamId } = req.body;
        const createdBy = req.user._id; // Từ middleware xác thực

        const newTask = new Task({
            title,
            description,
            dueDate,
            priority,
            createdBy,
            assignedTo: createdBy, // Mặc định gán cho người tạo
            teamId
        });

        const savedTask = await newTask.save();
        res.status(201).json({
            success: true,
            data: savedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
            $or: [
                { assignedTo: req.user._id },
                { createdBy: req.user._id }
            ]
        }).populate('assignedTo', 'username avatarUrl')
          .populate('createdBy', 'username')
          .populate('teamId', 'name');

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Kiểm tra quyền cập nhật
        if (task.assignedTo.toString() !== req.user._id.toString() && 
            task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this task"
            });
        }

        task.status = status;
        await task.save();

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        task.comments.push({
            text,
            createdBy: userId
        });

        await task.save();

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
                message: "Task not found"
            });
        }

        // Chỉ người tạo mới có thể xóa
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this task"
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
