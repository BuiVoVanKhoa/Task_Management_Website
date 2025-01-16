import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddTask from "../components/Tasks/AddTask";
import Tabs from "../components/Tasks/Tabs";
import TaskTitle from "../components/Tasks/TaskTitle";
import BoardView from "../components/Tasks/BoardView";
import ListView from "../components/Tasks/ListView";
import useTaskData from "../hooks/useTaskData";
import toast from "react-hot-toast";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md"; // Icon hiển thị bảng trello
import { FaList, FaTasks } from "react-icons/fa"; // Icon hiển thị danh sách
import { useSearchContext } from "../context/SearchContext";

const TABS = [
  {
    title: "Board View",
    icon: <MdGridView />,
  },
  {
    title: "List View",
    icon: <FaList />,
  },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const TasksPage = () => {
  const [selected, setSelected] = useState(0);
  const { task, error, loading, refetch } = useTaskData();
  const [showAddTask, setShowAddTask] = useState(false);
  const params = useParams();
  const status = params?.status || "";
  const { searchQuery } = useSearchContext();

  // Thêm log để debug
  console.log("SearchQuery in TasksPage:", searchQuery);
  console.log("Original tasks:", task);

  // Kiểm tra nếu task là undefined hoặc null thì gán mảng rỗng
  const tasks = task || [];

  // Thêm log để kiểm tra cấu trúc của task
  console.log("Task structure:", tasks[0]);

  // Sửa lại logic lọc
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;

    // Log để debug
    console.log("Checking task:", task);
    console.log("Search query:", searchQuery);

    // Kiểm tra tất cả các trường có thể chứa tên
    const taskName = task?.title || task?.name || "";
    console.log("Task name being compared:", taskName);

    return taskName.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  // Log kết quả cuối cùng
  console.log("Filtered results:", filteredTasks);

  useEffect(() => {
    if (error) {
      toast.error(error); // Chỉ gọi khi `error` thay đổi
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full lg:py-4 lg:px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center text-black dark:text-white">
          <FaTasks className="text-2xl mr-2 mt-1 text-blue-600" />
          <h1 className="font-bold text-3xl">Task</h1>
        </div>
        {!status && (
          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 "
          >
            <IoMdAdd className="h-5 w-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {/* Hiển thị form thêm Task */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-black/40 max-w-2xl w-full mx-4 overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex-shrink-0">
              <AddTask
                onClose={() => {
                  setShowAddTask(false);
                  refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Truyền chế độ xem */}
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
              <TaskTitle lable="To Do" className={TASK_TYPE.todo} />
              <TaskTitle
                lable="In Progress"
                className={TASK_TYPE["in progress"]}
              />
              <TaskTitle lable="Completed" className={TASK_TYPE.completed} />
            </div>
          )}

          {/* Hiển thị nội dung dựa trên tab được chọn */}
          {selected === 0 ? (
            <BoardView tasks={filteredTasks} refetch={refetch} />
          ) : (
            <div className="w-full">
              <ListView tasks={filteredTasks} refetch={refetch} />
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default TasksPage;
