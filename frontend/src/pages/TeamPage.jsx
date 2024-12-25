import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
// Import icons từ react-icons
import { FaUsers, FaCrown, FaPlus, FaDoorOpen } from 'react-icons/fa';
import { BsCodeSquare } from 'react-icons/bs';
import { MdDescription } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';

const TeamPage = () => {
  const { authUser } = useAuthContext();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [teamCode, setTeamCode] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setTeams(data.data || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Team created successfully!');
        setTeams([...teams, data.data]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/teams/join/${teamCode}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Successfully joined team!');
        setTeams([...teams, data.data]);
        setShowJoinModal(false);
        setTeamCode('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
    }
  };

  const handleResetDatabase = async () => {
    try {
      const response = await fetch('/api/teams/reset-db', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Database reset successfully');
        fetchTeams();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Failed to reset database');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-600 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers className="text-indigo-500" />
              Your Teams
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and collaborate with your teams
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Create Team
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FaDoorOpen className="mr-2" />
              Join Team
            </button>
            <button
              onClick={handleResetDatabase}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <IoMdRefresh className="mr-2" />
              Reset DB
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Teams Yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new team or joining an existing one.
            </p>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaPlus className="text-indigo-500" />
                Create New Team
              </h2>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', description: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Team Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaDoorOpen className="text-green-500" />
                Join Team
              </h2>
              <form onSubmit={handleJoinTeam}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Code
                  </label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setTeamCode('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamCard = ({ team }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      {/* Header with Team Avatar and Name */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600"></div>
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <img
              className="h-24 w-24 rounded-xl shadow-lg border-4 border-gray-50 dark:border-gray-800"
              src={team.avatar || "https://via.placeholder.com/150"}
              alt={team.name}
            />
            <div className="absolute -bottom-2 -right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
              <FaUsers className="text-green-600 dark:text-green-400" />
              {team.members?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="pt-16 px-6 pb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          {team.name}
        </h3>
        {team.description && (
          <div className="flex items-start gap-2 mb-4">
            <MdDescription className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {team.description}
            </p>
          </div>
        )}

        {/* Team Code Section */}
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <BsCodeSquare />
              Team Code
            </span>
            <code className="text-sm font-bold bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 px-4 py-1.5 rounded-md">
              {team.teamCode || 'N/A'}
            </code>
          </div>
        </div>

        {/* Team Leader Section */}
        <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <img
                className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                src={team.leader?.avatarUrl || 'https://via.placeholder.com/40'}
                alt={team.leader?.username}
              />
              <FaCrown className="absolute -top-1 -right-1 text-yellow-400 bg-gray-50 dark:bg-gray-800 rounded-full p-0.5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {team.leader?.username}
              </p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400">
                Team Leader
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
