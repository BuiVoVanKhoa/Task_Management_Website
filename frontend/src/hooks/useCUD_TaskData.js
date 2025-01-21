import axios from "axios";

const useCUD_TaskData = () => {

  const createTask = async (taskData) => {
    try {
      const response = await axios.post("/api/tasks/create", taskData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating task", error);
      throw error;
    }
  };

  const updateTask = async (_id, data) => {
    try {
      const response = await axios.put(`/api/tasks/${_id}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating task", error);
      throw error;
    }
  };

  const deleteTask = async (_id) => {
    try {
      const response = await axios.delete(`/api/tasks/${_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting task", error);
      throw error;
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
  };
};

export default useCUD_TaskData;