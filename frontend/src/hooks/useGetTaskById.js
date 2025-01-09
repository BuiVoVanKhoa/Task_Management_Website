import { useState, useEffect } from "react";

const useGetTaskById = (id, axiosInstance) => {
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/tasks/${id}`);
        setTask(response.data.data);
      } catch (error) {
        console.error('Error fetching task:', error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [id, axiosInstance]);

  return { task, error, loading };
};

export default useGetTaskById;
