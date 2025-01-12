import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Tạo context cho việc quản lý xác thực
const AuthContext = createContext();

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuthContext = () => {
  return useContext(AuthContext);
};

// Provider component để quản lý trạng thái xác thực
export const AuthContextProvider = ({ children }) => {
  // Các state quản lý thông tin người dùng và trạng thái xác thực
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hàm kiểm tra trạng thái xác thực của người dùng
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setAuthUser(data.user);
        setIsAuthenticated(true);
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
        if (data.message === "Token expired") {
          toast.error('Your session has expired. Please login again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setAuthUser(data.user);
        setIsAuthenticated(true);
        setUserToLocalStorage(data.user);
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  // Hàm xử lý đăng xuất
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setAuthUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  // Hàm xử lý đăng ký tài khoản mới
  const signup = async (userData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        setAuthUser(data.user);
        setIsAuthenticated(true);
        setUserToLocalStorage(data.user);
        toast.success('Signup successful!');
        return true;
      } else {
        toast.error(data.message || 'Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
      return false;
    }
  };

  // Hàm lưu thông tin người dùng vào localStorage
  const setUserToLocalStorage = (userData) => {
    const userToStore = {
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      gender: userData.gender,
      avatarUrl: userData.avatarUrl,
      createdAt: userData.createdAt
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  // Effect hook để kiểm tra xác thực khi component được mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Giá trị context được cung cấp cho các component con
  const contextValue = {
    authUser,
    setAuthUser,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
