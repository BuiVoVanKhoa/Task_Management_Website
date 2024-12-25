import clsx from 'clsx'
import React from 'react'
import { IoMdAdd } from 'react-icons/io'

const TaskTitle = ({ lable, className }) => {
  return (
    <div className='w-full h-10 md:h-12 px-2 md:px-4 rounded bg-white dark:bg-gray-800 flex items-center justify-between shadow-sm dark:shadow-gray-700/20'>
      <div className='flex gap-2 items-center'>
        <div className={clsx("w-4 h-4 rounded-full", className)} />
        <p className='text-sm md:text-base text-gray-600 dark:text-gray-400'>{lable}</p>
      </div>

      <button className="hover:bg-gray-100 dark:hover:bg-gray-500 p-1 rounded-full transition-colors">
        <IoMdAdd className='text-lg text-gray-600 dark:text-gray-400' />
      </button>
    </div>
  )
}

export default TaskTitle