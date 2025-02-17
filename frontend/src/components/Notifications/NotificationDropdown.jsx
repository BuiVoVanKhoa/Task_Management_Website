import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import useNotifications from '../../hooks/useNotifications';
import NotificationDetailModal from './NotificationDetailModal';
import { toast } from 'react-hot-toast';
import DeleteConfirmDialog from '../DeleteConfirmDialog';
import Tooltip from '../common/Tooltip';

const DeleteButton = ({ notification, onDelete }) => {
    if (!notification.isRead) {
        return null;
    }

    return (
        <button
            onClick={onDelete}
            className="p-1 rounded-full transition-all duration-200 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
            title="Delete notification"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    );
};

const NotificationDropdown = () => {
    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        markAsRead,
        markAllAsRead,
        loadMore,
        deleteNotification,
        refresh
    } = useNotifications();

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({
        show: false,
        notificationId: null
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Định nghĩa các nhóm thông báo
    const NOTIFICATION_CATEGORIES = {
        ALL: 'All',
        TASK: 'Task',
        TEAM: 'Team'
    };

    // Phân loại thông báo theo nhóm
    const getNotificationCategory = (type) => {
        switch (type) {
            case 'TASK_ASSIGNED':
            case 'TASK_STATUS_UPDATED':
            case 'TASK_UPDATE':
                return 'TASK';
            case 'TEAM_UPDATE':
            case 'MEMBER_ADDED':
            case 'MEMBER_REMOVED':
                return 'TEAM';
            default:
                return 'ALL';
        }
    };

    // Lọc thông báo theo nhóm đã chọn
    const filteredNotifications = notifications.filter(notification =>
        selectedCategory === 'ALL' || getNotificationCategory(notification.type) === selectedCategory
    );

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'TEAM_UPDATE':
                return '🔄';
            case 'TASK_ASSIGNED':
                return '📋';
            case 'TASK_STATUS_UPDATED':
                return '✅';
            case 'TASK_UPDATE':
                return '✏️';
            case 'MEMBER_ADDED':
                return '👥';
            case 'MEMBER_REMOVED':
                return '👤';
            default:
                return '📢';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setSelectedNotification(notification);
    };

    const handleDelete = (e, notification) => {
        e.stopPropagation();
        if (!notification.isRead) return;
        setDeleteConfirm({
            show: true,
            notificationId: notification._id
        });
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteNotification(deleteConfirm.notificationId);
            setDeleteConfirm({ show: false, notificationId: null });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <style>
                {`
                @keyframes bellRing {
                    0% { transform: rotate(0); }
                    20% { transform: rotate(8deg); }
                    40% { transform: rotate(-8deg); }
                    60% { transform: rotate(4deg); }
                    80% { transform: rotate(-4deg); }
                    100% { transform: rotate(0); }
                }
                @keyframes badgePulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .bell-animation:hover {
                    animation: bellRing 0.5s ease-in-out;
                }
                .badge-animation {
                    animation: badgePulse 2s infinite;
                }
                `}
            </style>
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none">
                        <div className="bell-animation p-2 rounded-full">
                            <BellIcon className="h-6 w-6 transition-transform duration-200" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="badge-animation absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 border-2 border-white dark:border-gray-800 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute -right-[50px] mt-2 w-96 max-w-[90vw] origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Header with mark all as read */}
                        <div className="px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                            <div className="flex items-center">
                                <BellIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Notification
                                </span>
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {unreadCount} mới
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                    Mark all as read
                                </button>
                                <button
                                    onClick={refresh}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Filter buttons */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex space-x-2">
                            {Object.entries(NOTIFICATION_CATEGORIES).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                                        ${selectedCategory === key
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Notifications list */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredNotifications.map((notification) => (
                                        <Menu.Item key={notification._id}>
                                            {({ active }) => (
                                                <div
                                                    className={`
                                                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                                                        ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400' : ''}
                                                        px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
                                                    `}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className={`text-xl flex-shrink-0 ${!notification.isRead ? 'animate-bounce' : ''}`}>
                                                            {getNotificationIcon(notification.type)}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'} truncate`}>
                                                                {notification.title}
                                                            </p>
                                                            <p className={`text-sm ${!notification.isRead ? 'text-blue-500 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'} line-clamp-2`}>
                                                                {notification.message}
                                                            </p>
                                                            <div className="mt-1 flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    {notification.sender && notification.sender.avatarUrl && (
                                                                        <img
                                                                            src={notification.sender.avatarUrl}
                                                                            alt={notification.sender.username}
                                                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                                                        />
                                                                    )}
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {notification.sender?.username || 'Unknown User'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-xs ${!notification.isRead ? 'text-blue-500 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                                                        {!notification.isRead && (
                                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <DeleteButton
                                                                        notification={notification}
                                                                        onDelete={(e) => handleDelete(e, notification)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            )}

                            {hasMore && (
                                <div className="p-2 text-center">
                                    <button
                                        onClick={loadMore}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                        See more
                                    </button>
                                </div>
                            )}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>

            <NotificationDetailModal
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
            />

            <DeleteConfirmDialog
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, notificationId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Notification"
                message="Are you sure you want to delete this notification? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </>
    );
};

export default NotificationDropdown;
