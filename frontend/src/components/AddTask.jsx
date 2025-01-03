import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { IoMdClose } from 'react-icons/io';
import { FaTasks, FaRegCalendarAlt, FaUserCircle, FaFlag } from 'react-icons/fa';
import { MdDescription, MdLowPriority, MdOutlinePriorityHigh } from 'react-icons/md';
import { BsFileEarmarkPlus, BsKanban } from 'react-icons/bs';
import { AiOutlineClockCircle } from 'react-icons/ai';

const AddTask = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [stage, setStage] = useState('todo');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assets, setAssets] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { authUser } = useAuthContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.error('Due date must be today or a future date');
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title,
                description,
                assignedTo: authUser._id,
                dueDate,
                priority,
                status: stage,
                attachments: assets ? [assets.name] : [],
            };

            const response = await fetch('api/tasks/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Task created successfully:', result);
                toast.success('Task created successfully!');
                onClose();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('An error occurred while creating the task');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setAssets(e.target.files[0]);
    };

    return (
        <>
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <FaTasks className="text-2xl text-blue-500 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Task</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <IoMdClose className="text-xl text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FaTasks className="text-gray-400 dark:text-gray-500" />
                        Task Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MdDescription className="text-gray-400 dark:text-gray-500" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                        rows="3"
                    ></textarea>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FaUserCircle className="text-gray-400 dark:text-gray-500" />
                        Assign Task To
                    </label>
                    <select
                        name="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Team Member</option>
                        <option value="member1">Member 1</option>
                        <option value="member2">Member 2</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <BsKanban className="text-gray-400 dark:text-gray-500" />
                            Task Stage
                        </label>
                        <select
                            name="stage"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="todo">To Do</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FaRegCalendarAlt className="text-gray-400 dark:text-gray-500" />
                            Due Date
                        </label>
                        <input
                            type="date"
                            name="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FaFlag className="text-gray-400 dark:text-gray-500" />
                            Priority Level
                        </label>
                        <div className="relative">
                            <select
                                name="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 pl-9"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                {priority === 'low' && <MdLowPriority className="text-blue-500" />}
                                {priority === 'medium' && <FaFlag className="text-yellow-500" />}
                                {priority === 'high' && <MdOutlinePriorityHigh className="text-red-500" />}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <BsFileEarmarkPlus className="text-gray-400 dark:text-gray-500" />
                            Add Assets
                        </label>
                        <input
                            type="file"
                            name="assets"
                            onChange={handleFileChange}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                            file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                            file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300
                            hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                        />
                        {assets && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Selected file: {assets.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-400 transition-colors inline-flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <AiOutlineClockCircle className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <FaTasks />
                                Create Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
};

export default AddTask;
