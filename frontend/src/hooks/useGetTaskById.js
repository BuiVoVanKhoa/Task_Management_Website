import { useState, useEffect } from "react";

const useGetTaskById = (_id, axiosInstance) => {
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!_id) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/tasks/${_id}`);
        setTask(response.data.data);
      } catch (error) {
        console.error('Error fetching task:', error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [_id, axiosInstance]);

  return { task, error, loading };
};

export default useGetTaskById;
