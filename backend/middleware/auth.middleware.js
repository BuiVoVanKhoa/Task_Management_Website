import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Lấy token từ cookie

    // Kiểm tra token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
      const user = await User.findById(decoded.userId).select("-password"); // Tìm người dùng

      // Kiểm tra người dùng tồn tại
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Gắn người dùng vào yêu cầu
      req.user = user;
      next();

      // Xử lý lỗi JWT
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
