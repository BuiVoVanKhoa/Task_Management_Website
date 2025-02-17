import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useNotifications from '../../hooks/useNotifications';
// import DeleteConfirmDialog from '../DeleteConfirmDialog';
// import Tooltip from '../common/Tooltip';

const DeleteButton = ({ notification, onDelete }) => {
    if (!notification.isRead) {
        return null;
    }

    return (
        <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
        >
            Delete
        </button>
    );
};

const NotificationDetailModal = ({ notification, onClose }) => {
    const { deleteNotification } = useNotifications();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteNotification(notification._id);
            onClose(); // Đóng modal sau khi xóa thành công
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!notification) return null;

    return (
        <>
            <Transition appear show={true} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                        >
                                            {notification.title}
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-500"
                                            onClick={onClose}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {notification.message}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center space-x-2">
                                        <img
                                            src={notification.sender.avatarUrl}
                                            alt={notification.sender.username}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {notification.sender.username}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {format(new Date(notification.createdAt), 'PPpp')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <DeleteButton 
                                            notification={notification} 
                                            onDelete={handleDelete} 
                                        />
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default NotificationDetailModal;
