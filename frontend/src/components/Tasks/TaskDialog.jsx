import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaTasks, FaUsers, FaRegCalendarAlt } from 'react-icons/fa';
import { MdDelete, MdLowPriority, MdDescription } from 'react-icons/md';
import { BsKanban, BsFileEarmarkPlus } from 'react-icons/bs';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import useCUD_TaskData from '../../hooks/useCUD_TaskData';

const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
];

const TaskDialog = ({ isOpen, onClose, task, onSuccess }) => {
    const { authUser } = useAuthContext();
    const { updateTask } = useCUD_TaskData();
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'low',
        dueDate: task?.dueDate ? new Date(task?.dueDate) : null,
        assignedTo: task?.assignedTo || [],
        attachments: task?.attachments || []
    });
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
    const [previousStatus, setPreviousStatus] = useState(task?.status);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (!task?.teamId?._id) return;
            
            try {
                const response = await axios.get(`/api/teams/${task.teamId._id}/members`, {
                    withCredentials: true
                });
                
                if (response.data?.members) {
                    const members = response.data.members.map(member => ({
                        value: member._id,
                        label: member.username
                    }));
                    setTeamMembers(members);
                } else {
                    console.error('Invalid response format:', response.data);
                    toast.error('Invalid response format from server');
                }
            } catch (error) {
                console.error('Error fetching team members:', error);
                toast.error('Failed to fetch team members');
            }
        };

        fetchTeamMembers();
    }, [task?.teamId?._id]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'low',
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo.map(user => user._id) : [],
                attachments: task.attachments || []
            });
        }
    }, [task]);

    const isAdmin = task?.createdBy?._id === authUser?._id;
    const isTeamMember = task?.assignedTo?.some(member => member._id === authUser?._id);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await updateTask(task._id, {
                ...formData,
                assignedTo: formData.assignedTo.map(userId => {
                    const member = teamMembers.find(m => m.value === userId);
                    return {
                        _id: userId,
                        username: member?.label,
                        avatarUrl: member?.avatarUrl
                    };
                })
            });
            
            if (response) {
                toast.success('Task updated successfully!');
                onSuccess && onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error(error.response?.data?.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAttachment = async (url) => {
        if (!isAdmin) {
            toast.error('Only task creator can delete attachments');
            return;
        }

        try {
            setLoading(true);
            const newAttachments = formData.attachments.filter(attachment => attachment !== url);
            setFormData(prev => ({ ...prev, attachments: newAttachments }));
            await updateTask(task._id, { ...formData, attachments: newAttachments });
        } catch (error) {
            console.error('Error deleting attachment:', error);
            toast.error('Failed to delete attachment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-10"
        >
            <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all mt-16">
                        <div className="flex flex-col h-full max-h-[90vh]">
                            <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
                                <FaTasks className="text-2xl text-blue-500 dark:text-blue-400 mr-2" />
                                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {isAdmin ? (
                                        <input
                                            type="text"
                                            value={formData.title || task?.title || ''}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            className="bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none px-1"
                                            disabled={loading}
                                        />
                                    ) : (
                                        task?.title
                                    )}
                                </Dialog.Title>
                            </div>

                            <div className="flex flex-col flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <BsKanban className="text-gray-400 dark:text-gray-500" />
                                                Task Stage
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => handleChange('status', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            >
                                                {STATUS_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {isAdmin && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                    <MdLowPriority className="text-gray-400 dark:text-gray-500" />
                                                    Priority Level
                                                </label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => handleChange('priority', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                >
                                                    {PRIORITY_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                        <FaUsers className="text-gray-400 dark:text-gray-500" />
                                                        Assign Task To
                                                    </label>
                                                    <Select
                                                        isMulti
                                                        value={teamMembers.filter(member => 
                                                            formData.assignedTo.includes(member.value)
                                                        )}
                                                        onChange={(selected) => {
                                                            handleChange('assignedTo', selected ? selected.map(s => s.value) : []);
                                                        }}
                                                        options={teamMembers}
                                                        isDisabled={loading}
                                                        className="w-full"
                                                        classNamePrefix="select"
                                                        placeholder="Select Team Members"
                                                        noOptionsMessage={() => "No members available"}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                        <FaRegCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                                        Due Date
                                                    </label>
                                                    <div className="relative w-full">
                                                        <DatePicker
                                                            selected={formData.dueDate ? new Date(formData.dueDate) : null}
                                                            onChange={(date) => handleChange('dueDate', date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={new Date()}
                                                            placeholderText="Select due date"
                                                            className="w-full h-[38px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                                            wrapperClassName="w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                    <MdDescription className="text-gray-400 dark:text-gray-500" />
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => handleChange('description', e.target.value)}
                                                    disabled={loading}
                                                    rows={4}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                    placeholder="Enter task description..."
                                                />
                                            </div>

                                            {formData.attachments.length > 0 && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <BsFileEarmarkPlus className="text-gray-400 dark:text-gray-500" />
                                                        Attachments
                                                    </label>
                                                    <div className="space-y-2">
                                                        {formData.attachments.map((url, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs flex items-center gap-2"
                                                                >
                                                                    <BsFileEarmarkPlus className="text-gray-400" />
                                                                    <span className="truncate">{url.split('/').pop()}</span>
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteAttachment(url)}
                                                                    disabled={loading}
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                >
                                                                    <MdDelete className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
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
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <FaSpinner className="animate-spin" />
                                                Updating...
                                            </span>
                                        ) : (
                                            'Update Task'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </div>

            <Dialog
                open={showStatusConfirmation}
                onClose={() => setShowStatusConfirmation(false)}
                className="relative z-20"
            >
                <div className="fixed inset-0 bg-black/25" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                Confirm Status Change
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Your status change request will be sent to the task creator for approval.
                                    Do you want to proceed?
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                                    onClick={() => setShowStatusConfirmation(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                                    onClick={() => setShowStatusConfirmation(false)}
                                >
                                    Send Request
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Dialog>
    );
};

export default TaskDialog;