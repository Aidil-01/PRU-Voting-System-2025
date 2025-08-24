import React from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  MapIcon,
  WifiIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '../../hooks/useSocket';

const Header = ({ currentPage, onNavigate, stats }) => {
  const { isConnected } = useSocket();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'voters', label: 'Pengundi', icon: UsersIcon },
    { id: 'villages', label: 'Kampung', icon: MapIcon },
    { id: 'parties', label: 'Parti', icon: UsersIcon },
    { id: 'voting', label: 'Pengundian', icon: CheckBadgeIcon },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistem PRU 2025
                </h1>
                <p className="text-xs text-gray-500">
                  Pilihan Raya Umum Malaysia
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status and Stats */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
              ${isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {isConnected ? (
                <CheckCircleIcon className="h-3 w-3" />
              ) : (
                <XCircleIcon className="h-3 w-3" />
              )}
              <span>{isConnected ? 'Sambungan Aktif' : 'Tiada Sambungan'}</span>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {stats.overall?.total_votes_cast || 0}
                  </div>
                  <div className="text-xs text-gray-500">Undi</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary-600">
                    {stats.overall?.overall_turnout_percentage || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Keluar</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600">
                    {stats.overall?.remaining_voters || 0}
                  </div>
                  <div className="text-xs text-gray-500">Baki</div>
                </div>
              </div>
            )}

            {/* Live Indicator */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">LANGSUNG</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;