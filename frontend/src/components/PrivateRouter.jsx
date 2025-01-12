import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { authUser, loading } = useAuthContext();

  // Hiển thị loading spinner khi đang kiểm tra xác thực
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị nội dung route (Outlet)
  // Nếu chưa đăng nhập, chuyển hướng về trang login
  return authUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
