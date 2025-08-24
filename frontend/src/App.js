import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Voters from './pages/Voters';
import Villages from './pages/Villages';
import Parties from './pages/Parties';
import Voting from './pages/Voting';
import { useVotingUpdates } from './hooks/useSocket';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { stats } = useVotingUpdates();

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'voters':
        return <Voters />;
      case 'villages':
        return <Villages />;
      case 'parties':
        return <Parties />;
      case 'voting':
        return <Voting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        stats={stats}
      />
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
    </div>
  );
}

export default App;