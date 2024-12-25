import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { authUser, isAuthenticated, loading: authLoading, checkAuth } = useAuthContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingTasks: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setDashboardData(data.dashboard || {
            totalTasks: 0,
            completedTasks: 0,
            upcomingTasks: [],
            recentActivity: [],
          });
        } else {
          console.error('Failed to fetch dashboard data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {authUser?.username}!</p>
      <p>Total Tasks: {dashboardData.totalTasks}</p>
      <p>Completed Tasks: {dashboardData.completedTasks}</p>

      <h2>Upcoming Tasks</h2>
      <ul>
        {dashboardData.upcomingTasks.map((task, index) => (
          <li key={index}>{task.title}</li>
        ))}
      </ul>

      <h2>Recent Activity</h2>
      <ul>
        {dashboardData.recentActivity.map((activity, index) => (
          <li key={index}>{activity.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;
