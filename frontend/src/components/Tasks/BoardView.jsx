import React from 'react'
import TaskCard from './TaskCard';
import { toast } from 'react-hot-toast';

const BoardView = ({ tasks, refetch }) => {
    // Kiểm tra tasks có phải là mảng không 
    if (!Array.isArray(tasks)) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No tasks found</div>;
    }

    // Xóa thông báo trùng lặp
    const handleTaskDeleted = (taskTitle) => {
        refetch();
    };

    return (
        <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10'>
            {tasks.map((task) => (
                <TaskCard
                    task={task}
                    key={task._id}
                    refetch={refetch}
                    onDeleteSuccess={() => handleTaskDeleted(task.title)}
                />
            ))}
        </div>
    );
};

export default BoardView