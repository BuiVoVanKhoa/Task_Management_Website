import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import AvatarSelector from '../components/AvatarSelector';

const Profile = () => {
  const { authUser, updateUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState({
    username: authUser?.username || '',
    email: authUser?.email || '',
    gender: authUser?.gender || '',
    avatarUrl: authUser?.avatarUrl || '/avt_profile/avt_0.jpg'
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An error occurred while updating profile');
    }
  };

  const handleAvatarSelect = (newAvatarUrl) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl
    }));
  };

  if (!authUser) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  return (
    <div className="bg-gray-100 py-8 dark:bg-gray-700">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md dark:bg-gray-900 relative">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
        >
          <FaEdit size={20} />
        </button>

        <div className="p-6">
          {/* Header with Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={formData.avatarUrl}
                alt={`${authUser.username}'s avatar`}
                className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
              />
              {isEditing && (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute bottom-6 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <FaCamera size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{authUser.username}</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-white">{authUser.email}</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : (
                    <p className="capitalize text-gray-800 dark:text-white">
                      {authUser.gender}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(authUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <FaSave className="mr-2" /> Update Profile
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: authUser.username,
                    email: authUser.email,
                    gender: authUser.gender,
                    avatarUrl: authUser.avatarUrl
                  });
                }}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          )}

          {showAvatarSelector && (
            <AvatarSelector
              currentAvatar={formData.avatarUrl}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarSelector(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
