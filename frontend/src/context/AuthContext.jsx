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
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        // Chỉ hiển thị thông báo khi token hết hạn
        if (data.message === "Token expired") {
          toast.error('Your session has expired. Please login again.');
        }
      }
    } catch (error) {
      // Không hiển thị lỗi khi chưa đăng nhập
      setAuthUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
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
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        localStorage.removeItem('user');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('user');
      return { success: false, message: 'An error occurred during login' };
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
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'An error occurred during logout' };
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = (userData) => {
    setAuthUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Bước 1: Khởi tạo đăng ký và gửi mã xác thực
  const initiateSignup = async (userData) => {
    try {
      const response = await fetch('/api/auth/initiate-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification code has been sent to your email');
        return true;
      } else {
        toast.error(data.message || 'Failed to send verification code');
        return false;
      }
    } catch (error) {
      console.error('Signup initiation error:', error);
      toast.error('An error occurred while sending verification code');
      return false;
    }
  };

  // Bước 2: Hoàn tất đăng ký với mã xác thực
  const completeSignup = async (email, verificationCode) => {
    try {
      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration completed successfully! Please login.');
        return true;
      } else {
        toast.error(data.message || 'Verification failed');
        return false;
      }
    } catch (error) {
      console.error('Signup completion error:', error);
      toast.error('An error occurred during verification');
      return false;
    }
  };

  // Kiểm tra xác thực khi component được mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      localStorage.removeItem('user');
    }
    checkAuth();
  }, []);

  // Giá trị được cung cấp cho context
  const contextValue = {
    authUser,
    loading,
    isAuthenticated,
    login,
    logout,
    initiateSignup,
    completeSignup,
    updateUser,
    checkAuth
  };

  // Hiển thị loading khi đang kiểm tra xác thực
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
