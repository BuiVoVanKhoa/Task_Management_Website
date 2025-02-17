import mongoose from "mongoose";
import { DASHBOARD_LAYOUTS, WIDGET_TYPES } from "../utils/constants.js";

// Lược đồ cho widget trong bảng điều khiển
const widgetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(WIDGET_TYPES),
    required: true,
  },
  position: {
    x: {
      type: Number,
      required: true,
      min: 0,
    },
    y: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  size: {
    width: {
      type: Number,
      required: true,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Cho phép lưu các cài đặt tùy chỉnh
    default: new Map(),
  },
});

// Schema chính cho dashboard
const dashboardSchema = new mongoose.Schema(
  {
    // Liên kết với user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Tự động tạo index
    },
    // Kiểu layout của dashboard
    layout: {
      type: String,
      enum: Object.values(DASHBOARD_LAYOUTS),
      default: DASHBOARD_LAYOUTS.LIST,
    },
    // Danh sách các widget
    widgets: [widgetSchema],
    // Các bộ lọc được áp dụng
    filters: {
      showCompleted: {
        type: Boolean,
        default: true,
      },
      priorityFilter: [
        {
          type: String,
          enum: ["low", "medium", "high"],
        },
      ],
      dateRange: {
        start: Date,
        end: Date,
      },
    },
    // Theme của dashboard
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

export default mongoose.model("Dashboard", dashboardSchema);
