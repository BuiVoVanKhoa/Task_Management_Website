// Định nghĩa các trạng thái của nhiệm vụ 
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "inprogress",
  COMPLETED: "completed",
};

// Định nghĩa các mức độ ưu tiên của nhiệm vụ
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// Định nghĩa vai trò của người dùng
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Định nghĩa vai trò của thành viên nhóm
export const TEAM_MEMBER_ROLES = {
  MEMBER: "member",
  ADMIN: "admin",
};

// Định nghĩa kiểu bố cục bảng Dashboard
export const DASHBOARD_LAYOUTS = {
  LIST: "list",
  GRID: "grid",
  KANBAN: "kanban",
};

// Định nghĩa các tiện ích 
export const WIDGET_TYPES = {
  TASKS: "tasks",
  CALENDAR: "calendar",
  TEAM: "team",
  STATISTICS: "statistics",
};
