import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import useTaskData from '../../hooks/useTaskData';

const Chart = () => {
    const { task } = useTaskData();

    // Calculate tasks by priority
    const tasksByPriority = {
        high: task?.filter((t) => t.priority === 'high').length || 0,
        medium: task?.filter((t) => t.priority === 'medium').length || 0,
        low: task?.filter((t) => t.priority === 'low').length || 0,
    };

    const data = [
        {
            name: 'High',
            tasks: tasksByPriority.high,
            color: '#ef4444', // red
        },
        {
            name: 'Medium',
            tasks: tasksByPriority.medium,
            color: '#f59e0b', // amber
        },
        {
            name: 'Low',
            tasks: tasksByPriority.low,
            color: '#22c55e', // green
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                    dataKey="tasks"
                    name="Number of Tasks"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                >
                    {data.map((entry, index) => (
                        <Bar
                            key={`cell-${index}`}
                            fill={entry.color}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Chart;