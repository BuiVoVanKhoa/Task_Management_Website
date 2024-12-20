import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setAuthUser(null);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setAuthUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token không hợp lệ hoặc hết hạn
        localStorage.removeItem('token');
        setAuthUser(null);
        setIsAuthenticated(false);
        if (data.message === "Token has expired") {
          toast.error('Your session has expired. Please login again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      setAuthUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setAuthUser(data.user);
        setIsAuthenticated(true);
        toast.success('Logged in successfully');
        return true;
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthUser(null);
      setIsAuthenticated(false);
      toast.error('Login failed');
      return false;
    }
  };

  const register = async (username, email, password, gender) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, gender })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setAuthUser(data.user);
        setIsAuthenticated(true);
        toast.success('Registered successfully');
        return true;
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthUser(null);
      setIsAuthenticated(false);
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('token');
        setAuthUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const value = {
    authUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
