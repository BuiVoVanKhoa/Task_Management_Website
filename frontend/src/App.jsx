import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Task from './pages/Task';
import Team from './pages/Team';

const App = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Task />} />
            <Route path="/teams" element={<Team />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
