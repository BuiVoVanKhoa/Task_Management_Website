import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Lấy danh sách thông báo
    const fetchNotifications = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/notifications?page=${page}`, {
                withCredentials: true
            });

            if (response.data.success) {
                const { notifications, totalPages, currentPage, unreadCount } = response.data.data;
                setNotifications(prev => page === 1 ? notifications : [...prev, ...notifications]);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setUnreadCount(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    // Đánh dấu thông báo đã đọc
    const markAsRead = async (notificationId) => {
        try {
            const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, {
                withCredentials: true
            });

            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationId
                            ? { ...notif, isRead: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    // Đánh dấu tất cả thông báo đã đọc
    const markAllAsRead = async () => {
        try {
            const response = await axios.put('/api/notifications/read-all', {}, {
                withCredentials: true
            });

            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notif => ({ ...notif, isRead: true }))
                );
                setUnreadCount(0);
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    // Xóa thông báo
    const deleteNotification = async (notificationId) => {
        try {
            const response = await axios.delete(`/api/notifications/${notificationId}`, {
                withCredentials: true
            });

            if (response.data.success) {
                // Cập nhật state local sau khi xóa
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                
                // Cập nhật unreadCount nếu thông báo chưa đọc bị xóa
                const deletedNotification = notifications.find(n => n._id === notificationId);
                if (deletedNotification && !deletedNotification.isRead) {
                    setUnreadCount(prev => prev - 1);
                }
                
                toast.success('Notification deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error(error.response?.data?.message || 'Failed to delete notification');
            throw error;
        }
    };

    // Load more notifications
    const loadMore = () => {
        if (currentPage < totalPages && !loading) {
            fetchNotifications(currentPage + 1);
        }
    };

    // Refresh notifications
    const refresh = () => {
        setCurrentPage(1);
        fetchNotifications(1);
    };

    // Auto refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(refresh, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        hasMore: currentPage < totalPages,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh
    };
};

export default useNotifications;
