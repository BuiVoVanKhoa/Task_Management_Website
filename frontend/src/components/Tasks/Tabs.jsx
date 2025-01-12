import React from 'react'
import { Tab } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Tabs = ({ tabs, selected, setSelected, children }) => {
    return (
        <div className='w-full px-1 sm-px-0'>
            {/* Quản lý trạng thái của các tab */}
            <Tab.Group defaultIndex={selected}>
                {/* Hiển thị danh sách tab */}
                <Tab.List className="flex space-x-6 rounded-xl p-1">
                    {
                        tabs.map((tab, index) => (
                            <Tab
                                key={tab.title}
                                onClick={() => setSelected(index)}
                                // Thiết lập trạng thái tab
                                className={({ selected }) =>
                                    classNames(
                                        "w-fit flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 bg-white dark:bg-gray-800",
                                        selected
                                            ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500"
                                            : "text-gray-800 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400"
                                    )
                                }
                            >
                                {tab.icon}
                                <span>{tab.title}</span>
                            </Tab>
                        ))
                    }
                </Tab.List>
                {children}
            </Tab.Group>
        </div>
    )
}

export default Tabs