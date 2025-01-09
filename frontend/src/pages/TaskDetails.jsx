import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp, MdOutlineMessage, MdDelete } from 'react-icons/md';
import { HiMiniChevronLeft } from 'react-icons/hi2';
import useGetTaskById from '../hooks/useGetTaskById';

// Tạo axios instance với cấu hình chung
const axiosInstance = axios.create({
  baseURL: '',  // Empty baseURL since we're using Vite's proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for sending cookies
});

// Không cần interceptor vì chúng ta sẽ sử dụng cookie

const TASK_CONFIG = {
  priority: {
    icons: {
      high: <MdKeyboardDoubleArrowUp />,
      medium: <MdKeyboardArrowUp />,
      low: <MdKeyboardArrowDown />,
    },
    styles: {
      low: "text-blue-600 dark:text-blue-400",
      medium: "text-yellow-500 dark:text-yellow-400",
      high: "text-red-500 dark:text-red-400"
    },
    bgColors: {
      high: 'bg-red-200',
      medium: 'bg-yellow-200',
      low: 'bg-blue-200',
    }
  },
  status: {
    styles: {
      todo: "bg-blue-600 dark:bg-blue-500",
      inprogress: "bg-yellow-600 dark:bg-yellow-500",
      completed: "bg-green-600 dark:bg-green-500",
    }
  }
};

const Avatar = ({ username, className = "" }) => (
  <div className={clsx('w-10 h-10 rounded-full text-white flex items-center justify-center text-sm bg-blue-600', className)}>
    <span className='text-center'>{username?.charAt(0)?.toUpperCase()}</span>
  </div>
);

const PriorityBadge = ({ priority }) => (
  <div className={clsx(
    "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
    TASK_CONFIG.priority.styles[priority],
    TASK_CONFIG.priority.bgColors[priority]
  )}>
    <span className='text-lg'>{TASK_CONFIG.priority.icons[priority]}</span>
    <span className='uppercase'>{priority} Priority</span>
  </div>
);

const StatusBadge = ({ status }) => (
  <div className="flex items-center gap-2">
    <div className={clsx('w-4 h-4 rounded-full', TASK_CONFIG.status.styles[status])} />
    <span className='text-black uppercase'>{status}</span>
  </div>
);

const formatDate = (date, format = 'en-GB') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(format, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const CommentItem = ({ comment, onDelete, currentUserId }) => {
  const formattedDate = new Date(comment?.createdAt).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const canDelete = currentUserId === comment?.createdBy?._id;

  return (
    <div className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        {comment?.createdBy?.avatar ? (
          <img
            src={comment.createdBy.avatar}
            alt={comment.createdBy.username}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xl text-white">
              {comment?.createdBy?.username?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {comment?.createdBy?.username || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">{formattedDate}</p>
              {canDelete && (
                <button
                  onClick={() => onDelete(comment._id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">{comment?.text}</p>
      </div>
    </div>
  );
};

const CommentForm = ({ onSubmit, isSubmitting, value, onChange }) => (
  <form onSubmit={onSubmit} className="mt-4">
    <div className="flex flex-col space-y-3">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Write a comment..."
        className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 text-sm"
        rows="3"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  </form>
);

const CommentSection = ({ taskId, comments: initialComments = [], task }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Lấy thông tin user từ localStorage
  const userInfo = JSON.parse(localStorage.getItem('user')) || {};
  const userToken = localStorage.getItem('token');
  
  console.log('=== Debug Info ===');
  console.log('Task:', {
    id: task?._id,
    title: task?.title,
    createdBy: task?.createdBy,
    assignedTo: task?.assignedTo
  });
  console.log('User Info:', {
    fromStorage: userInfo,
    hasToken: !!userToken
  });

  // Kiểm tra quyền comment
  const canComment = task && (
    task.assignedTo?.some(user => user._id === userInfo._id) || 
    task.createdBy?._id === userInfo._id
  );

  console.log('Permission Check:', {
    canComment,
    isCreator: task?.createdBy?._id === userInfo._id,
    isAssigned: task?.assignedTo?.some(user => user._id === userInfo._id),
    creatorId: task?.createdBy?._id,
    userId: userInfo._id
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting || !canComment) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `/api/tasks/${taskId}/comment`,
        { text: newComment.trim() }
      );

      if (response.data.success) {
        const { comment } = response.data;
        setComments(prevComments => [...prevComments, comment]);
        setNewComment('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(`/api/tasks/${taskId}/comment/${commentId}`);
      
      if (response.data.success) {
        setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        toast.success('Comment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MdOutlineMessage className="text-gray-400 text-xl" />
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
        <span className="bg-gray-100 text-gray-600 text-sm px-2.5 py-0.5 rounded-full">
          {comments?.length || 0}
        </span>
      </div>

      <CommentForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      {!canComment && (
        <p className="text-sm text-red-500 mt-2">Only assigned users or task creator can comment</p>
      )}

      <div className="mt-6 space-y-4">
        {!comments?.length ? (
          <p className="text-center text-gray-500 py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment?._id}
              comment={comment}
              onDelete={handleDeleteComment}
              currentUserId={userInfo._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskTeam = ({ createdBy, assignedTo = [] }) => (
  <div className='space-y-4'>
    <p className='text-gray-600 font-semibold text-sm'>TASK TEAM</p>
    <div className='space-y-3'>
      <div className='flex gap-4 py-2 items-center border-t border-gray-200'>
        <Avatar username={createdBy?.username} />
        <div className="flex flex-col">
          <span className="text-gray-800 font-medium">{createdBy?.username}</span>
          <span className="text-sm text-gray-500">Team Leader</span>
        </div>
      </div>

      {assignedTo.map((member, index) => (
        <div key={index} className='flex gap-4 py-2 items-center border-t border-gray-200'>
          <Avatar username={member?.username} />
          <div className="flex flex-col">
            <span className="text-gray-800 font-medium">{member?.username}</span>
            <span className="text-sm text-gray-500">Team Member</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ImageGallery = ({ images = [], onImageClick }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`Task attachment ${index + 1}`}
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 cursor-pointer"
          onClick={handleCloseImage}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { task, error, loading } = useGetTaskById(id, axiosInstance);

  if (loading) return <div className="flex items-center justify-center p-8">Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div className="flex items-center justify-center p-8">Task not found</div>;

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='bg-white shadow-md rounded-lg overflow-hidden p-4'>
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/tasks')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <HiMiniChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className='text-2xl text-black font-bold'>{task?.title}</h1>
        </div>
        <div className='flex flex-col lg:flex-row'>
          <div className='w-full lg:w-1/2 p-6'>
            <div className='space-y-6'>
              <div className='flex items-center gap-5'>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>

              <p className='text-gray-500'>
                Due Date: {formatDate(task?.dueDate)}
              </p>

              <div className='space-y-2'>
                <h3 className='font-semibold text-gray-700'>Description</h3>
                <p className='text-gray-600'>{task?.description}</p>
              </div>

              <TaskTeam createdBy={task.createdBy} assignedTo={task.assignedTo} />
              <ImageGallery images={task.attachments} />
            </div>
          </div>

          <div className='hidden lg:block w-px bg-gray-200 mx-0'></div>

          <div className='w-full lg:w-1/2 p-6 border-t lg:border-t-0'>
            <CommentSection taskId={id} comments={task?.comments} task={task} />
          </div>
        </div>
      </div>

      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={task?.attachments[selectedImageIndex]}
              alt={`Task attachment ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300"
              onClick={handleCloseImage}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;