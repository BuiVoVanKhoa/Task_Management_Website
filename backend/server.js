import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import các routes
import userRouter from "./router/user.router.js";
import taskRouter from "./router/task.router.js";
import teamRouter from "./router/team.router.js";
import dashboardRouter from "./router/dashboard.router.js";
import notificationRouter from "./router/notification.router.js";

// Cấu hình biến môi trường
dotenv.config();

const PORT = process.env.PORT;
const app = express();

// Middleware cơ bản
app.use(express.json({ limit: "50mb" })); // Tăng giới hạn kích thước JSON
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Tăng giới hạn kích thước form data
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Cho phép frontend truy cập
    credentials: true, // Cho phép gửi cookies qua CORS
  })
);

// Đăng ký các routes
app.use("/api/auth", userRouter); // Xác thực và quản lý user
app.use("/api/tasks", taskRouter); // Quản lý tasks
app.use("/api/teams", teamRouter); // Quản lý teams
app.use("/api/dashboard", dashboardRouter); // Quản lý dashboard
app.use("/api/notifications", notificationRouter); // Quản lý thông báo

// Xuất build folder
if (process.env.NODE_ENV === "production") {
  const frontendBuildPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

// Middleware xử lý lỗi toàn cục
app.use(errorHandler);

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Khởi động server
app.listen(PORT, () => {
  connectDB(); // Kết nối đến MongoDB
  console.log(`Server is running on port http://localhost:${PORT}`);
});
