import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/user-tasks', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Todo Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">To Do</h2>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'todo')
              .map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">In Progress</h2>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'inprogress')
              .map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Completed</h2>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === 'completed')
              .map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal would go here */}
    </div>
  );
};

const TaskCard = ({ task, onStatusChange }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{task.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
        >
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TasksPage;
