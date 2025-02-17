import Notification from '../models/notification.models.js';

// Tạo thông báo mới
export const createNotification = async ({
    recipientId,
    senderId,
    teamId,
    type,
    title,
    message
}) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            team: teamId,
            type,
            title,
            message
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Lấy danh sách thông báo của người dùng
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username avatarUrl')
            .populate('team', 'name');

        const totalNotifications = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({ 
            recipient: userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                totalPages: Math.ceil(totalNotifications / limit),
                currentPage: page,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting notifications'
        });
    }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error marking notification as read'
        });
    }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error marking all notifications as read'
        });
    }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;
        
        // Tìm thông báo và kiểm tra quyền
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Kiểm tra xem thông báo đã đọc chưa
        if (!notification.isRead) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete unread notification'
            });
        }

        // Xóa thông báo
        await notification.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
