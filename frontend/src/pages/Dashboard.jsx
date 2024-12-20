import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { MdTaskAlt, MdCheckCircle, MdGroups, MdPerson } from "react-icons/md";

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        <Header />
        <main className="p-6 mt-12"> {/* Add margin-top to move the cards lower */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tasks Overview Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <MdTaskAlt className="text-blue-500 text-4xl mr-4" />
              <div>
                <h2 className="text-xl font-bold mb-2">Total Tasks</h2>
                <p className="text-3xl font-extrabold text-blue-500">3</p>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <MdCheckCircle className="text-green-500 text-4xl mr-4" />
              <div>
                <h2 className="text-xl font-bold mb-2">Completed Tasks</h2>
                <p className="text-3xl font-extrabold text-green-500">1</p>
              </div>
            </div>

            {/* Teams Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <MdGroups className="text-purple-500 text-4xl mr-4" />
              <div>
                <h2 className="text-xl font-bold mb-2">Teams</h2>
                <p className="text-3xl font-extrabold text-purple-500">5</p>
              </div>
            </div>

            {/* Employees Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <MdPerson className="text-orange-500 text-4xl mr-4" />
              <div>
                <h2 className="text-xl font-bold mb-2">Employees</h2>
                <p className="text-3xl font-extrabold text-orange-500">25</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
