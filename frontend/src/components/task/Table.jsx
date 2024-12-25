import React from "react";
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from 'react-icons/md'
import { BiMessageAltDetail } from 'react-icons/bi';
import clsx from "clsx";
import UserAvatar from '../UserAvatar';

const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
}

const PRIORITY_STYLES = {
    low: "text-blue-600",
    medium: "text-yellow-500",
    high: "text-red-500"
}

const TASK_TYPE = {
    todo: "bg-blue-600",
    "in progress": "bg-yellow-600",
    completed: "bg-green-600",
}

const Table = ({ tasks }) => {
    const deleteTask = (taskId) => {
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No tasks found
            </div>
        );
    }

    return (
        <div className="bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="w-full border-b border-gray-300">
                        <tr className="text-black text-left">
                            <th className="py-2 px-4">Task Title</th>
                            <th className="py-2 px-4">Priority</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Due Date</th>
                            <th className="py-2 px-4">Assigned To</th>
                            <th className="py-2 px-4">Assets</th>
                            <th className="py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task._id} className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10">
                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx('w-4 h-4 rounded-full', TASK_TYPE[task.status])} />
                                        <p className="w-full line-clamp-2 text-base text-black">{task.title}</p>
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
                                    {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4">
                                    {task.assignedTo && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                <UserAvatar user={task.assignedTo} />
                                            </div>
                                            <span className="text-sm">
                                                {task.assignedTo.username}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-2 px-4">
                                    <div className='flex items-center gap-3'>
                                        <div className='flex gap-1 items-center text-sm text-gray-600'>
                                            <BiMessageAltDetail />
                                            <span>{task?.comments?.length || 0}</span>
                                        </div>
                                        <div className='flex gap-1 items-center text-sm text-gray-600'>
                                            <MdAttachFile />
                                            <span>{task?.attachments?.length || 0}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 px-4">
                                    <div className="flex items-center gap-4">
                                        <a 
                                            href="#"
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={(e) => {
                                                e.preventDefault();
                                            }}
                                        >
                                            Edit
                                        </a>
                                        <a 
                                            href="#"
                                            className="text-red-600 hover:text-red-800"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deleteTask(task._id);
                                            }}
                                        >
                                            Delete
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;