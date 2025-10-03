import React, { useState, useEffect} from 'react';
import {UserPlus, Upload, LogOut, Users, FileSpreadsheet} from 'lucide-react';
import LoginPage from '../page/login';
import AgentsList from '../page/agentList';
import BatchesView from '../page/batchesView';
import ListsView from '../page/listView';
import AddAgentForm from './add-agent-form';
import UploadCSV from './upload-csv';

export default function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={18} />
              <span>Agents</span>
            </button>
            <button
              onClick={() => setCurrentView('addAgent')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'addAgent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserPlus size={18} />
              <span>Add Agent</span>
            </button>
            <button
              onClick={() => setCurrentView('upload')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload size={18} />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => setCurrentView('lists')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'lists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet size={18} />
              <span>Lists</span>
            </button>
            <button
              onClick={() => setCurrentView('batches')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentView === 'batches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet size={18} />
              <span>Batches</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {currentView === 'dashboard' && <AgentsList token={token} />}
          {currentView === 'addAgent' && <AddAgentForm token={token} />}
          {currentView === 'upload' && <UploadCSV token={token} />}
          {currentView === 'lists' && <ListsView token={token} />}
          {currentView === 'batches' && <BatchesView token={token} />}
        </div>
      </div>
    </div>
  );
}
