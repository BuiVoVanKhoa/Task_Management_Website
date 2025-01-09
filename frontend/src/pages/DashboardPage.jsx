import React from 'react';
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from 'react-icons/md';
import { LuClipboardPenLine } from 'react-icons/lu';
import { FaNewspaper, FaUsers } from 'react-icons/fa';
import { FaArrowsToDot } from 'react-icons/fa6';
import useTaskData from '../hooks/useTaskData';
import clsx from 'clsx';
import Chart from '../components/Dashboard/Chart';

const DashboardPage = () => {
  const { task, loading } = useTaskData();

  // Calculate totals from task data
  const totals = {
    completed: task?.filter(t => t.status === 'completed').length || 0,
    inprogress: task?.filter(t => t.status === 'inprogress').length || 0,
    todo: task?.filter(t => t.status === 'todo').length || 0
  };

  const stats = [
    {
      _id: '1',
      lable: 'TOTAL TASK',
      total: task?.length || 0,
      icon: <FaNewspaper />,
      bg: 'bg-[#1d4ed8]',
    },
    {
      _id: '2',
      lable: 'COMPLETED TASK',
      total: totals.completed,
      icon: <MdAdminPanelSettings />,
      bg: 'bg-[#0f766e]',
    },
    {
      _id: '3',
      lable: 'TASK IN PROGRESS',
      total: totals.inprogress,
      icon: <LuClipboardPenLine />,
      bg: 'bg-[#f59e0b]',
    },
    {
      _id: '4',
      lable: 'TODOS',
      total: totals.todo,
      icon: <FaArrowsToDot />,
      bg: 'bg-[#be185d]',
    },
  ];

  const Card = ({ lable, count, bg, icon }) => {
    return (
      <div className={'w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between'}>
        <div className='h-full flex flex-1 flex-col justify-between'>
          <p className='text-base text-gray-600'>{lable}</p>
          <span className='text-2xl font-semibold'>{count}</span>
        </div>

        <div className={clsx('w-10 h-10 rounded-full items-center justify-center text-white flex', bg)}>
          {icon}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className='h-full py-4'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
        {stats.map(({ icon, bg, lable, total }, index) => (
          <Card
            key={index}
            icon={icon}
            bg={bg}
            lable={lable}
            count={total}
          />
        ))}
      </div>

      <div className='w-full bg-white my-16 p-4 rounded shawdow-sm'>
        <h4 className='text-xl text-gray-600 font-semibold'>Chart by Priority</h4>
        <Chart />
      </div>
    </div>
  );
};

export default DashboardPage;