import React, { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from 'react-icons/md'
import { BiMessageAltDetail } from 'react-icons/bi';
import clsx from 'clsx'
import TaskDialog from './task/TaskDialog'
import { FaList } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

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
    "in progress": "bg-yellow-600 dark:bg-yellow-500",
    completed: "bg-green-600 dark:bg-green-500",
}

const BGS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
];

const TaskCard = ({ task }) => {
    const { authUser } = useAuthContext();
    const [open, setOpen] = useState(false);

    return (
        <div className='w-full h-fit bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/20 p-4 rounded'>
            <div className='w-full flex justify-between'>
                <div className={clsx(
                    "flex flex-1 gap-1 items-center text-sm font-medium",
                    PRIOTITYSTYELS[task?.priority]
                )}>
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                </div>

                {authUser?.isAdmin && <TaskDialog task={task} />}
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <div className={clsx('w-4 h-4 rounded-full', TASK_TYPE[task.status])} />
                    <h4 className='line-clamp-1 text-gray-900 dark:text-gray-100'>{task?.title}</h4>
                </div>

                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                    <span className='font-semibold mr-1'>
                        Assign Task To:
                    </span>
                    {task?.assignedTo?.username}
                </p>

                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                    <span className='font-semibold mr-1'>
                        Description:
                    </span>
                    {task?.description}
                </p>

                <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {new Date(task?.dueDate).toLocaleDateString()}
                </span>
            </div>

            <div className='w-full border-t border-gray-300 dark:border-gray-600 my-2' />

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                        <BiMessageAltDetail />
                        <span>{task?.comments?.length}</span>
                    </div>
                    <div className='flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400'>
                        <MdAttachFile />
                        <span>{task?.attachments?.length}</span>
                    </div>
                </div>

                <div className='flex flex-row-reverse'>
                    {task?.assignedTo && (
                        <div
                            className={clsx(
                                'w-8 h-8 rounded-full text-white flex items-center justify-center text-sm border-2 border-white dark:border-gray-700 overflow-hidden',
                                BGS[0]
                            )}
                        >
                            <UserAvatar user={task.assignedTo} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TaskCard;