import React from 'react';



const Task = () => {
  const tasks = [
    { id: 1, title: 'Task 1', status: 'Pending' },
    { id: 2, title: 'Task 2', status: 'In Progress' },
    { id: 3, title: 'Task 3', status: 'Completed' },
  ];

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl mb-4">Task List</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b">
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Task;
