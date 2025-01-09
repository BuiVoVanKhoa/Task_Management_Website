/**
 * Controllers cho Task Management
 * Xử lý tất cả các thao tác liên quan đến tasks
 */

import Task from "../models/tasks.models.js";
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
      teamId
    } = req.body;

    const createdBy = req.user._id;

    // Validate required fields
    if (!title || !description || !dueDate || !teamId) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // Ensure assignedTo is an array and not empty
    if (!assignedTo || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one user must be assigned to the task",
      });
    }

    // Validate attachments
    if (attachments && !Array.isArray(attachments)) {
      return res.status(400).json({
        success: false,
        message: "Attachments must be an array",
      });
    }

    // Create new task
    const newTask = new Task({
      title,
      description,
      dueDate,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      attachments: attachments || [],
      createdBy,
      teamId
    });

    await newTask.save();

    // Populate user information
    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "username avatarUrl")
      .populate("createdBy", "username")
      .populate("teamId", "name");

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
        path: 'comments.createdBy',
        select: 'username avatar _id'
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Kiểm tra quyền truy cập
    const isCreator = task.createdBy._id.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(user => user._id.toString() === req.user._id.toString());
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
    console.error('Error in getTaskById:', error);
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

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Kiểm tra quyền cập nhật
    if (
      task.assignedTo.toString() !== req.user._id.toString() &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    task.status = status;
    await task.save();

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

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Kiểm tra xem user có phải là người được assign hoặc người tạo task không
    const isAssigned = task.assignedTo.some(id => id.toString() === userId.toString());
    const isCreator = task.createdBy.toString() === userId.toString();

    if (!isAssigned && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only assigned users or task creator can comment",
      });
    }

    // Add the new comment with user reference
    const newComment = {
      text: text.trim(),
      createdBy: userId,
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    // Populate the createdBy field before sending response
    await task.populate([
      {
        path: 'comments.createdBy',
        select: 'username avatar'
      }
    ]);

    const savedComment = task.comments[task.comments.length - 1];

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: savedComment
    });
  } catch (error) {
    console.error('Error in addTaskComment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment"
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
