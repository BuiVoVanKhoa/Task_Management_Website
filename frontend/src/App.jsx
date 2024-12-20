import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Team from './pages/Team';
import Dashboard from './pages/Dashboard';
import Task from './pages/Task';
import Header from './components/Header';

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/task" element={<Task />} />
            <Route path="/team" element={<Team />} />
            <Route path="/Header" element={<Header />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
