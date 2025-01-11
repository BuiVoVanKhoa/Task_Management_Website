import React from 'react';
import { MdOutlineMessage } from 'react-icons/md';
import { FaBug, FaTasks, FaThumbsUp, FaUser } from 'react-icons/fa';
import { GrInProgress } from 'react-icons/gr';
import { MdOutlineDoneAll } from 'react-icons/md';

const ACTIVITY_ICONS = {
  COMMENT: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage className="text-xl" />
    </div>
  ),
  STATUS_CHANGE: (
    <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
      <FaTasks className="text-xl" />
    </div>
  ),
  ASSIGNMENT: (
    <div className='w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white'>
      <FaUser className="text-xl" />
    </div>
  ),
  BUG_REPORT: (
    <div className='w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white'>
      <FaBug className="text-xl" />
    </div>
  ),
  COMPLETED: (
    <div className='w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white'>
      <MdOutlineDoneAll className="text-xl" />
    </div>
  ),
  IN_PROGRESS: (
    <div className='w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white'>
      <GrInProgress className="text-xl" />
    </div>
  )
};

const getActivityIcon = (type) => {
  return ACTIVITY_ICONS[type] || ACTIVITY_ICONS.STATUS_CHANGE;
};

const getActivityMessage = (activity) => {
  const username = activity.createdBy?.username || 'Someone';
  
  switch (activity.type) {
    case 'COMMENT':
      return {
        action: 'commented',
        details: activity.text
      };
    case 'STATUS_CHANGE':
      return {
        action: `changed status to ${activity.newStatus}`,
        details: activity.details
      };
    case 'ASSIGNMENT':
      return {
        action: `assigned to ${activity.assignedTo?.username || 'someone'}`,
        details: null
      };
    case 'BUG_REPORT':
      return {
        action: 'reported a bug',
        details: activity.details
      };
    case 'COMPLETED':
      return {
        action: 'marked as completed',
        details: activity.details
      };
    case 'IN_PROGRESS':
      return {
        action: 'started working on this task',
        details: activity.details
      };
    default:
      return {
        action: 'updated the task',
        details: null
      };
  }
};

const TimelineItem = ({ activity, isLast }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { action, details } = getActivityMessage(activity);
  const username = activity.createdBy?.username || 'Someone';

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span
          className="absolute top-12 left-5 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}
      <div className="relative flex space-x-3">
        <div>{getActivityIcon(activity.type)}</div>
        <div className="flex min-w-0 flex-1 justify-between space-x-4">
          <div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{username}</span>
              {' '}{action}
            </div>
            {details && (
              <p className="mt-1 text-sm text-gray-500">{details}</p>
            )}
          </div>
          <div className="whitespace-nowrap text-right text-sm text-gray-500">
            <time>{formatDate(activity.createdAt || activity.timestamp)}</time>
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity._id || idx}>
            <TimelineItem
              activity={activity}
              isLast={idx === activities.length - 1}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;
