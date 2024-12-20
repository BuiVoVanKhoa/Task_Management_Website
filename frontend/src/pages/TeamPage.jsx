import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

const TeamPage = () => {
  const { authUser } = useAuthContext();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Teams</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Team
        </button>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Teams Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create a team to start collaborating with others.</p>
        </div>
      )}

      {/* Create Team Modal would go here */}
    </div>
  );
};

const TeamCard = ({ team }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{team.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{team.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Members</h4>
          <div className="flex -space-x-2">
            {team.members.map((member) => (
              <div
                key={member._id}
                className="relative"
                title={member.username}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.username}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {team.tasks.length} Tasks
          </span>
          <button className="text-sm text-blue-600 hover:text-blue-500">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
