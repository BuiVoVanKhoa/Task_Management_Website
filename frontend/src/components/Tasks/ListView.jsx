import React, { useState } from "react";
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from 'react-icons/md'
import { BiMessageAltDetail } from 'react-icons/bi';
import { FaEdit, FaTrash } from 'react-icons/fa';
import clsx from "clsx";
import useCUD_TaskData from '../../hooks/useCUD_TaskData';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import TaskDialog from './TaskDialog';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
}

const PRIORITY_STYLES = {
    low: "text-blue-600 dark:text-blue-400",
    medium: "text-yellow-500 dark:text-yellow-400",
    high: "text-red-500 dark:text-red-400"
}

const TASK_TYPE = {
    todo: "bg-blue-600 dark:bg-blue-500",
    inprogress: "bg-yellow-600 dark:bg-yellow-500",
    completed: "bg-green-600 dark:bg-green-500",
}

const ListView = ({ tasks, refetch }) => {
    const { deleteTask } = useCUD_TaskData();
    const { authUser } = useAuthContext();
    const [editingTask, setEditingTask] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingTask, setDeletingTask] = useState(null);

    const handleDelete = async () => {
        if (!deletingTask) return;

        try {
            setIsDeleting(true);
            await deleteTask(deletingTask._id);
            refetch();
            toast.success(`Task "${deletingTask.title}" deleted successfully!`);
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Failed to delete task. Please try again.');
        } finally {
            setIsDeleting(false);
            setDeletingTask(null);
        }
    };

    const canDeleteTask = (task) => {
        return authUser && (task.createdBy._id === authUser._id);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tasks found
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 px-2 md:px-4 pt-4 pb-9 shadow-md dark:shadow-gray-700/20 rounded">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="w-full border-b border-gray-300 dark:border-gray-600">
                        <tr className="text-gray-900 dark:text-gray-100 text-left">
                            <th className="py-2 px-4">Task Title</th>
                            <th className="py-2 px-4">Priority</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Due Date</th>
                            <th className="py-2 px-4">Job assigner</th>
                            <th className="py-2 px-4">Assigned To</th>
                            <th className="py-2 px-4">Assets</th>
                            <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task._id} className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300/10 dark:hover:bg-gray-700/30">
                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx('w-4 h-4 rounded-full', TASK_TYPE[task.status])} />
                                        <p className="w-full line-clamp-2 text-base text-gray-900 dark:text-gray-100">{task.title}</p>
                                    </div>
                                </td>

                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-1">
                                        <span className={clsx("text-lg", PRIORITY_STYLES[task.priority])}>
                                            {ICONS[task.priority]}
                                        </span>
                                        <span className="capitalize line-clamp-1">
                                            {task.priority}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-2 px-4">
                                    <span className="capitalize">{task.status}</span>
                                </td>

                                <td className="py-2 px-4">
                                    {new Date(task?.dueDate).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </td>

                                <td className="py-2 px-4">
                                    {task?.createdBy?.username}
                                </td>

                                <td className="py-2 px-4">
                                    {Array.isArray(task?.assignedTo) && task.assignedTo.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {task.assignedTo.map((user, index) => (
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
                                                ))}
                                            </div>
                                            <span className="text-sm ml-2">
                                                {task.assignedTo.map(user => user.username).join(', ')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <img
                                                className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                                                src='https://via.placeholder.com/40'
                                                alt="No assignee"
                                                title="No assignee"
                                            />
                                            <span className="text-sm">No assignee</span>
                                        </div>
                                    )}
                                </td>

                                <td className="py-2 px-4">
                                    <div className='flex items-center gap-3'>
                                        <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                                            <BiMessageAltDetail />
                                            <span>{task?.comments?.length || 0}</span>
                                        </div>
                                        <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                                            <MdAttachFile />
                                            <span>{task?.attachments?.length || 0}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            onClick={() => handleEdit(task)}
                                        >
                                            <FaEdit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        {canDeleteTask(task) && (
                                            <button
                                                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                onClick={() => setDeletingTask(task)}
                                            >
                                                <FaTrash className="w-4 h-4" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingTask && (
                <TaskDialog
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    onSuccess={() => {
                        refetch();
                        setEditingTask(null);
                    }}
                />
            )}

            <DeleteConfirmDialog
                isOpen={!!deletingTask}
                onClose={() => setDeletingTask(null)}
                onConfirm={handleDelete}
                title={deletingTask?.title}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default ListView;