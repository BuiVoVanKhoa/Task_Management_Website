import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Component hiển thị thông báo
import { ThemeProvider } from "./context/ThemeContext"; // Provider quản lý theme sáng/tối
import { SearchProvider } from "./context/SearchContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import TaskDetails from "./pages/TaskDetails";
import TeamPage from "./pages/TeamPage";
import NotFoundPage from "./pages/NotFoundPage";
import Profile from "./pages/Profile";

// Import các components chung
import PrivateRoute from "./components/PrivateRouter"; // Component bảo vệ route cần đăng nhập
import Layout from "./components/Layout"; // Component layout chung cho ứng dụng

function App() {
  return (
    <SearchProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-100 transition-colors duration-200">
            <Toaster position="top-center" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:id" element={<TaskDetails />} />
                  <Route path="/teams" element={<TeamPage />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </SearchProvider>
  );
}

export default App;
