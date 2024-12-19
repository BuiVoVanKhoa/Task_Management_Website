import Dashboard from '../models/dashboard.models.js';
import Task from '../models/tasks.models.js';
import Team from '../models/team.models.js';

// Lấy hoặc tạo dashboard cho user
export const getUserDashboard = async (req, res) => {
    try {
        let dashboard = await Dashboard.findOne({ user: req.user._id });

        // Nếu chưa có dashboard, tạo mới với cấu hình mặc định
        if (!dashboard) {
            dashboard = new Dashboard({
                user: req.user._id,
                layout: 'list',
                widgets: [
                    {
                        type: 'tasks',
                        position: { x: 0, y: 0 },
                        size: { width: 6, height: 4 }
                    },
                    {
                        type: 'calendar',
                        position: { x: 6, y: 0 },
                        size: { width: 6, height: 4 }
                    }
                ]
            });
            await dashboard.save();
        }

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật cấu hình dashboard
export const updateDashboard = async (req, res) => {
    try {
        const { layout, widgets, filters, theme } = req.body;

        const dashboard = await Dashboard.findOne({ user: req.user._id });
        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: "Dashboard not found"
            });
        }

        // Cập nhật các trường nếu có
        if (layout) dashboard.layout = layout;
        if (widgets) dashboard.widgets = widgets;
        if (filters) dashboard.filters = filters;
        if (theme) dashboard.theme = theme;

        await dashboard.save();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy dữ liệu tổng quan cho dashboard
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Lấy thống kê task
        const taskStats = await Task.aggregate([
            {
                $match: {
                    $or: [
                        { assignedTo: userId },
                        { createdBy: userId }
                    ]
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Lấy các task sắp đến hạn
        const upcomingTasks = await Task.find({
            assignedTo: userId,
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày tới
            }
        }).sort({ dueDate: 1 }).limit(5);

        // Lấy danh sách team của user
        const teams = await Team.find({
            'members.user': userId
        }).select('name members');

        // Lấy task theo độ ưu tiên
        const priorityStats = await Task.aggregate([
            {
                $match: {
                    assignedTo: userId
                }
            },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                taskStats,
                upcomingTasks,
                teams,
                priorityStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Thêm widget mới vào dashboard
export const addWidget = async (req, res) => {
    try {
        const { type, position, size, settings } = req.body;

        const dashboard = await Dashboard.findOne({ user: req.user._id });
        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: "Dashboard not found"
            });
        }

        dashboard.widgets.push({
            type,
            position,
            size,
            settings
        });

        await dashboard.save();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa widget khỏi dashboard
export const removeWidget = async (req, res) => {
    try {
        const { widgetId } = req.params;

        const dashboard = await Dashboard.findOne({ user: req.user._id });
        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: "Dashboard not found"
            });
        }

        dashboard.widgets = dashboard.widgets.filter(
            widget => widget._id.toString() !== widgetId
        );

        await dashboard.save();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};