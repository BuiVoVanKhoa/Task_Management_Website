import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const useCUD_TeamData = () => {
  const [loading, setLoading] = useState(false);

  const createTeam = async (formData) => {
    setLoading(true);
    try {
      const avatarPath = `/avt_group/${formData.avatar || 'avt-0'}.jpg`;
      const teamData = {
        name: formData.name,
        description: formData.description,
        avatar: avatarPath,
      };

      const response = await axios.post('/api/teams', teamData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Team created successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'An error occurred while creating the team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamCode) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/teams/join/${teamCode}`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Successfully joined team!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to join team');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error(error.message || 'An error occurred while joining the team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetDatabase = async () => {
    try {
      const response = await axios.post('/api/teams/reset-db', {}, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Database reset successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Reset database error:', error);
      toast.error('Failed to reset database');
    }
  };

  // Xóa đội
  const deleteTeam = async (teamId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/teams/${teamId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Team deleted successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'An error occurred while deleting the team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTeamMembers = async (teamId) => {
    setLoading(true);
    // console.log('Team ID trên hooks từ đầu:', teamId);
    try {
      const response = await axios.get(`/api/teams/${teamId}/members`, {
        withCredentials: true
      });

      if (response.data.success) {
        // console.log('Response from API:', response.data);
        return response.data.members; 
      } else {
        throw new Error(response.data.message || 'Failed to get team members');
      }
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    } finally {
      setLoading(false);
      // console.log('Team ID từ hooks:', teamId);
    }
  };

  const removeTeamMember = async (teamId, memberId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/teams/${teamId}/members/${memberId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Member removed from group');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove team member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async (teamId) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/teams/${teamId}/leave`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Successfully left the team!');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to leave team');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error(error.response?.data?.message || 'An error occurred while leaving the team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId, formData) => {
    setLoading(true);
    try {
      const avatarPath = formData.avatar ? `/avt_group/${formData.avatar}.jpg` : undefined;
      const teamData = {
        name: formData.name,
        description: formData.description,
        ...(avatarPath && { avatar: avatarPath }),
      };

      const response = await axios.put(`/api/teams/${teamId}`, teamData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Team updated successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error(error.response?.data?.message || 'An error occurred while updating the team');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTeam,
    joinTeam,
    resetDatabase,
    deleteTeam,
    getTeamMembers,
    removeTeamMember,
    leaveTeam,
    updateTeam,
    loading
  };
};

export default useCUD_TeamData;
