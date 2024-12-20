import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { authUser } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <h1 className="text-5xl font-bold mb-6">Task Management System</h1>
        <p className="text-xl mb-8">
          Streamline your workflow, collaborate with team members, and achieve more together.
        </p>
        
        <div className="space-x-4">
          {authUser ? (
            <Link
              to="/dashboard"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Task Management</h3>
            <p>Create, organize, and track tasks efficiently</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
            <p>Work together seamlessly with your team</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p>Monitor progress and achieve your goals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
