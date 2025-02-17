import React, { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from 'react-icons/md'
import { BiMessageAltDetail } from 'react-icons/bi';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx'
import TaskDialog from './TaskDialog'
import DeleteConfirmDialog from '../DeleteConfirmDialog'
import useCUD_TaskData from '../../hooks/useCUD_TaskData';
import toast from 'react-hot-toast'; // Import toast

const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
}

const PRIOTITYSTYELS = {
    low: "text-blue-600 dark:text-blue-400",
    medium: "text-yellow-500 dark:text-yellow-400",
    high: "text-red-500 dark:text-red-400"
}

const TASK_TYPE = {
    todo: "bg-blue-600 dark:bg-blue-500",
    inprogress: "bg-yellow-600 dark:bg-yellow-500",
    completed: "bg-green-600 dark:bg-green-500",
}

const TaskCard = ({ task, refetch, onDeleteSuccess }) => {
    const { authUser } = useAuthContext();
    const [isOpen, setIsOpen] = useState(false);
    const { deleteTask } = useCUD_TaskData();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        console.log('Current task:', task);
        console.log('Current authUser:', authUser);

        if (!canDeleteTask(task)) {
            toast.error("You don't have permission to delete this task");
            return;
        }

        try {
            setIsDeleting(true);
            await deleteTask(task._id);
            refetch(); // Làm mới danh sách tác vụ sau khi xóa thành công
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
            toast.success(`Task "${task.title}" deleted successfully!`);
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Failed to delete task. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
            setShowDeleteDialog(false);
        }
    };

    const canDeleteTask = (task) => {
        // console.log('Task for delete check:', task);
        return authUser && 
               task && 
               task.createdBy && 
               (typeof task.createdBy === 'object' ? 
                   task.createdBy._id === authUser._id : 
                   task.createdBy === authUser._id);
    };

    const handleViewDetails = () => {
        navigate(`/tasks/${task._id}`);
        setShowMenu(false);
    };

    const handleEdit = () => {
        setIsOpen(true);
        setShowMenu(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
            <div className='w-full flex justify-between'>
                <div className={clsx(
                    "flex flex-1 gap-1 items-center text-sm font-medium",
                    PRIOTITYSTYELS[task?.priority]
                )}>
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <HiEllipsisVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                                <button
                                    onClick={handleViewDetails}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                                >
                                    <FaEye className="mr-3" />
                                    View Details
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                                >
                                    <FaEdit className="mr-3" />
                                    Edit
                                </button>
                                {canDeleteTask(task) && (
                                    <button
                                        onClick={() => {
                                            setShowDeleteDialog(true);
                                            setShowMenu(false);
                                        }}
                                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                                    >
                                        <FaTrash className="mr-3" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className='flex items-center gap-2 mb-1'>
                    <div className={clsx('w-4 h-4 rounded-full', TASK_TYPE[task.status])} />
                    <h4 className='line-clamp-1 text-gray-900 dark:text-gray-100'>{task?.title}</h4>
                </div>

                {/* Hiển thị thông tin người giao việc */}
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                    <span className='font-semibold mr-1'>
                        Job assigner:
                    </span>
                    {task?.createdBy?.username}
                </p>

                {/* Hiển thị người thực hiện */}
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                    <span className='font-semibold mr-1'>
                        Assign Task To:
                    </span>
                    <span>
                        {Array.isArray(task?.assignedTo) && task.assignedTo.length > 0
                            ? task.assignedTo.map(user => user.username).join(', ')
                            : 'No assignee'}
                    </span>
                </p>

                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-1'>
                    <span className='font-semibold mr-1'>
                        Description:
                    </span>
                    {task?.description}
                </p>

                <p className='text-sm text-gray-600 dark:text-gray-400'>
                    <span className='font-semibold mr-1'>
                        Due Date:
                    </span>
                    {new Date(task?.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                </p>
            </div>

            <div className='w-full border-t border-gray-300 dark:border-gray-600 my-2' />

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                        <BiMessageAltDetail />
                        <span>{task?.comments?.length} comments</span>
                    </div>
                    <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                        <MdAttachFile />
                        <span>{task?.attachments?.length || 0} files</span>
                    </div>
                </div>

                <div className="pt-4 flex -space-x-2 overflow-hidden">
                    {Array.isArray(task?.assignedTo) && task.assignedTo.length > 0 ? (
                        task.assignedTo.map((user, index) => (
                            <img
                                key={user._id || index}
                                className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700 inline-block"
                                src={user.avatarUrl || 'https://via.placeholder.com/40'}
                                alt={user.username}
                                title={user.username}
                                onError={(e) => {
                                    console.log('Image failed to load:', e);
                                    e.target.src = 'https://via.placeholder.com/40';
                                }}
                            />
                        ))
                    ) : (
                        <img
                            className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                            src='https://via.placeholder.com/40'
                            alt="No assignee"
                            title="No assignee"
                        />
                    )}
                </div>
            </div>

            <TaskDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                task={task}
                onSuccess={() => {
                    setIsOpen(false);
                    refetch();
                }}
            />

            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete the task "${task.title}"? This action will:
• Permanently remove the task
• Delete all associated comments
• Cannot be undone`}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default TaskCard;