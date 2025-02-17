import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaTasks, FaRegCalendarAlt, FaUserCircle, FaFlag, FaUsers } from 'react-icons/fa';
import { MdDescription, MdLowPriority, MdOutlinePriorityHigh } from 'react-icons/md';
import { BsFileEarmarkPlus, BsKanban } from 'react-icons/bs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Thư viện dd/mm/yyyy
import useCUD_TaskData from '../../hooks/useCUD_TaskData';
import useTeamData from '../../hooks/useTeamData';
import { useAuthContext } from '../../context/AuthContext';
import Select from 'react-select'; // Thư viện react-select

const AddTask = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [assignedTo, setAssignedTo] = useState([]);
    const [status, setStatus] = useState('todo');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const { createTask } = useCUD_TaskData();
    const { team, loading: teamsLoading } = useTeamData();
    const { authUser } = useAuthContext();

    // Lọc ra các team mà user là admin
    const adminTeams = team ? team.filter(t =>
        t.members.some(member =>
            member.user._id === authUser._id && member.role === 'admin'
        )
    ) : [];

    useEffect(() => {
        if (selectedTeam && team) {
            const currentTeam = team.find(t => t._id === selectedTeam);
            if (currentTeam) {
                // Lọc ra các thành viên quản trị và tạo tùy chọn cho react-select
                const nonAdminMembers = currentTeam.members
                    .filter(member => member.role !== 'admin')
                    .map(member => ({
                        value: member.user._id,
                        label: member.user.username
                    }));
                setTeamMembers(nonAdminMembers);
                setAssignedTo([]); // Đặt lại các thành viên đã chọn khi nhóm thay đổi

                // Kiểm tra xem người dùng hiện tại có phải là quản trị viên của nhóm này không
                const userRole = currentTeam.members.find(
                    member => member.user._id === authUser._id
                )?.role;
                setIsAdmin(userRole === 'admin');
            }
        }
    }, [selectedTeam, team, authUser]);

    // Hàm xử lý ngày hết hạn và định dạng ngày
    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setDueDate(formattedDate);
        } else {
            setDueDate('');
        }
    };

    // Hàm xử lý tệp đính kèm
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const newAttachments = [];

        for (const file of files) {
            try {
                // Kiểm tra kích thước file
                if (file.size > maxSize) {
                    toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
                    continue;
                }

                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                newAttachments.push(base64);
            } catch (error) {
                console.error('Error converting file to base64:', error);
                toast.error(`Error processing file ${file.name}`);
            }
        }

        // Kiểm tra tổng kích thước
        const totalSize = newAttachments.reduce((acc, curr) => acc + curr.length, 0);
        if (totalSize > 10 * 1024 * 1024) { // 10MB
            toast.error('Total file size exceeds 10MB limit');
            return;
        }

        setAttachments(prev => [...prev, ...newAttachments]);
    };

    // Hàm kiểm tra tính hợp lệ của dữ liệu
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin) {
            toast.error('Only team admins can create tasks');
            return;
        }

        if (!title || !description || !dueDate || !selectedTeam) {
            toast.error('Please fill in all required fields!');
            return;
        }

        if (!assignedTo || assignedTo.length === 0) {
            toast.error('At least one user must be assigned to the task');
            return;
        }

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
                dueDate,
                status,
                priority,
                assignedTo: assignedTo.map(member => member.value),
                attachments,
                teamId: selectedTeam
            };

            const response = await createTask(taskData);
            toast.success('Task created successfully!');
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error.response?.data?.message || 'An error occurred while creating the task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <FaTasks className="text-2xl text-blue-500 dark:text-blue-400 mr-2" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Task</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-6 flex-1">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <FaUsers className="text-gray-400 dark:text-gray-500" />
                                Team
                            </label>
                            <select
                                name="team"
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                required
                            >
                                <option value="">Select Team</option>
                                {adminTeams.map((t) => (
                                    <option key={t._id} value={t._id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <FaUserCircle className="text-gray-400 dark:text-gray-500" />
                                Assign Task To
                            </label>
                            <Select
                                isMulti
                                name="assignedTo"
                                value={assignedTo}
                                onChange={setAssignedTo}
                                options={teamMembers}
                                isDisabled={!selectedTeam || !isAdmin}
                                classNamePrefix="select"
                                placeholder="Select Team Members"
                                noOptionsMessage={() => "No members available"}
                            />
                            {!isAdmin && selectedTeam && (
                                <p className="mt-1 text-sm text-red-500">Only team admins can create tasks</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <BsKanban className="text-gray-400 dark:text-gray-500" />
                                Task Stage
                            </label>
                            <select
                                name="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            >
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <FaRegCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                Due Date
                            </label>
                            <div className="w-full">
                                <DatePicker
                                    selected={dueDate ? new Date(dueDate) : null}
                                    onChange={handleDateChange}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    required
                                    minDate={new Date()}
                                    wrapperClassName="w-full"
                                />
                            </div>
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
                                Attachments
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                            {attachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {attachments.length} file(s) selected
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTask;
