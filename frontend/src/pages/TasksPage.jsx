import { useState, useEffect } from "react"; // Hook useState và useEffect
import Loading from "../components/Loading"; // Component Loader hiển thị khi tải
import Title from "../components/Title"; // Component Title
import Tabs from "../components/Tabs"; // Component Tabs
import { IoMdAdd } from 'react-icons/io'; // Icon thêm mới
import { MdGridView } from 'react-icons/md'; // Icon hiển thị bảng trello
import { FaList } from 'react-icons/fa'; // Icon hiển thị danh sách
import { useParams } from "react-router-dom"; // Hook để lấy tham số từ URL
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import AddTask from "../components/AddTask";
import Table from "../components/task/Table";

const TABS = [
  {
    title: "Board View", icon: <MdGridView />
  },
  {
    title: "List View", icon: <FaList />
  }
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const [selected, setSelected] = useState(0);
  const [tasks, setTasks] = useState([]); // Danh sách tasks
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [showAddTask, setShowAddTask] = useState(false);
  const params = useParams(); // Lấy tham số từ URL
  const status = params?.status || "";

  // Fetch task data
  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const response = await fetch('/api/tasks/user-tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setTasks(data.data);  
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserTasks();
  }, []);

  // Nếu đang tải dữ liệu, hiển thị Loader
  return loading ? (
    <div className="flex items-center justify-center h-full mt-64"> {/* Sử dụng h-full để chiếm chiều cao của sidebar */}
      <div className="text-center">
        <Loading /> {/* Loader hiển thị */}
      </div>
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        {!status && (
          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <IoMdAdd className="h-5 w-5 mr-2" />
            Creat Task
          </button>
        )}
      </div>

      {/* Hiển thị form thêm Task */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <AddTask onClose={() => setShowAddTask(false)} /> {/* Đóng form khi nhấn */}
          </div>
        </div>
      )}

      <div>
        {/* Truyền chế độ xem */}
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
              <TaskTitle lable="To Do" className={TASK_TYPE.todo} />
              <TaskTitle lable="In Progress" className={TASK_TYPE['in progress']} />
              <TaskTitle lable="Completed" className={TASK_TYPE.completed} />
            </div>
          )}

          {/* Hiển thị nội dung dựa trên tab được chọn */}
          {selected === 0 ? (
            <BoardView tasks={tasks} />
          ) : (
            <div className="w-full">
              <Table tasks={tasks} />
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Tasks;
