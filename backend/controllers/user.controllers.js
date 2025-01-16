import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import mailSender from "../helpers/mail.sender.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    // Kiểm tra xem email đã được sử dụng chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Tạo avatar mặc định
    const avatarUrl = "/avt_profile/avt_0.jpg";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set role
    const userRole = "user";

    const newUser = new User({
      username,
      password: hashedPassword,
      gender,
      email,
      avatarUrl,
      role: userRole,
    });
    await newUser.save();

    // Gửi email chào mừng
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; text-align: center;">Chào mừng đến với Task Management!</h2>
        <p style="color: #34495e;">Xin chào ${username},</p>
        <p style="color: #34495e;">Chúc mừng bạn đã đăng ký tài khoản Task Management thành công!</p>
        <p style="color: #34495e;">Bạn có thể bắt đầu sử dụng hệ thống ngay bây giờ để:</p>
        <ul style="color: #34495e;">
          <li>Tạo và quản lý các task</li>
          <li>Tham gia các team</li>
          <li>Theo dõi tiến độ công việc</li>
        </ul>
        <p style="color: #34495e;">Chúc bạn có những trải nghiệm tuyệt vời!</p>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #7f8c8d;">Task Management Team</p>
        </div>
      </div>
    `;

    await mailSender({
      email,
      subject: "Chào mừng đến với Task Management",
      html: emailHtml
    });

    // Tạo mã token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Đặt token làm cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        gender: newUser.gender,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Tạo token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Đặt token làm cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Xác minh mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy người dùng từ cơ sở dữ liệu
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
    } else {
      console.error("Token verification error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, gender, avatarUrl } = req.body;
    const userId = req.user._id;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !gender) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Kiểm tra xem email mới có bị trùng không (nếu email thay đổi)
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        gender,
        avatarUrl: avatarUrl || '/avt_profile/avt_0.jpg',
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};
