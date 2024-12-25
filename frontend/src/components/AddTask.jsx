import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

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

    // Kiểm tra xem token có tồn tại không
    const token = localStorage.getItem('token');
    if (!authUser || !token) {
        console.error('Token xác thực không hợp lệ hoặc không tồn tại');
        return; // Ngừng thực hiện nếu không có token
    }

    // Hàm xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra ngày
        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

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
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Task created successfully:', result);
                toast.success('Task created successfully!');
                onClose(); // Đóng form sau khi tạo thành công
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

    // Hàm xử lý thay đổi file
    const handleFileChange = (e) => {
        setAssets(e.target.files[0]);
    };

    return (
        <div className="p-6">
            <div className="flex justify-center items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Add New Task</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                    <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        rows="3"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Task To</label>
                    <select
                        name="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Team Member</option>
                        <option value="member1">Member 1</option>
                        <option value="member2">Member 2</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Task Stage</label>
                        <select
                            name="stage"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="todo">To Do</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                        <select
                            name="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Assets</label>
                        <input
                            type="file"
                            name="assets"
                            onChange={handleFileChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTask;
