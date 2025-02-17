import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const useTaskData = () => {
  const [task, setTask] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/tasks/user-tasks");
      setTask(response.data.data);
    } catch (error) {
      setError(error.message);
      toast.error("Fetch error: " + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    task,
    error,
    loading,
    refetch: fetchTasks
  };
};

export default useTaskData;
