import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import StatCard, { VoterStatCard } from '../components/Dashboard/StatCard';
import VotingChart from '../components/Charts/VotingChart';
import { useVotingUpdates } from '../hooks/useSocket';
import { votersAPI } from '../services/api';
import { formatDateTime, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Real-time updates from Socket.io
  const { stats: socketStats, lastUpdate, refreshStats } = useVotingUpdates();

  // Load initial stats
  useEffect(() => {
    loadStats();
  }, []);

  // Update stats when socket data changes
  useEffect(() => {
    if (socketStats) {
      setStats(socketStats);
      setLastRefresh(new Date());
    }
  }, [socketStats]);

  const loadStats = async () => {
    try {
      const response = await votersAPI.getStats();
      setStats(response.data);
      setLastRefresh(new Date());
      toast.success('Data dikemaskini');
    } catch (error) {
      console.error('Error loading stats:', error);
      // Use socket data as fallback
      if (socketStats) {
        setStats(socketStats);
        toast.success('Data dikemaskini dari socket');
      } else {
        toast.error('Gagal memuat statistik');
      }
    }
  };

  const handleRefresh = () => {
    refreshStats();
    loadStats();
    toast.success('Data dikemaskini');
  };


  const overall = stats?.overall || {};
  const partyStats = stats?.by_party || [];
  const villageStats = stats?.by_village || [];
  const recentVotes = stats?.recent_votes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard PRU 2025
          </h1>
          <p className="text-gray-600 mt-1">
            Statistik langsung Pilihan Raya Umum Malaysia
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Dikemaskini: {timeAgo(lastRefresh)}
          </div>
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Kemaskini</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <VoterStatCard
          totalVoters={overall.total_voters || 0}
          votedVoters={overall.total_votes_cast || 0}
          isLive={true}
        />
        
        <StatCard
          title="Jumlah Undi Dikeluarkan"
          value={overall.total_votes_cast || 0}
          icon={CheckBadgeIcon}
          color="green"
          isLive={true}
          subtitle="Undi yang telah direkodkan"
        />
        
        <StatCard
          title="Pengundi Belum Mengundi"
          value={overall.remaining_voters || 0}
          icon={ClockIcon}
          color="yellow"
          isLive={true}
          subtitle="Menunggu untuk mengundi"
        />
        
        <StatCard
          title="Peratusan Keluar"
          value={overall.overall_turnout_percentage || 0}
          icon={ChartBarIcon}
          color="blue"
          isPercentage={true}
          isLive={true}
          subtitle="Kadar kehadiran pengundi"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <VotingChart
          data={partyStats}
          type="bar"
          title="Undi Mengikut Parti (Bar Chart)"
        />
        
        <VotingChart
          data={partyStats.filter(p => p.vote_count > 0)}
          type="pie"
          title="Taburan Undi Mengikut Parti (Pie Chart)"
        />
      </div>

      {/* Village Turnout and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Village Turnout */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Peratusan Keluar Mengikut Kampung
            </h3>
          </div>
          
          <div className="space-y-4">
            {villageStats.slice(0, 10).map((village, index) => (
              <div key={village.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white
                    ${index < 3 ? 'bg-primary-600' : 'bg-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {village.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {village.votes_cast}/{village.total_voters} pengundi
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`
                    font-semibold text-sm
                    ${village.turnout_percentage >= 70 ? 'text-green-600' :
                      village.turnout_percentage >= 50 ? 'text-yellow-600' :
                      village.turnout_percentage >= 30 ? 'text-orange-600' :
                      'text-red-600'
                    }
                  `}>
                    {village.turnout_percentage || 0}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`
                        h-2 rounded-full transition-all duration-500
                        ${village.turnout_percentage >= 70 ? 'bg-green-500' :
                          village.turnout_percentage >= 50 ? 'bg-yellow-500' :
                          village.turnout_percentage >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }
                      `}
                      style={{ width: `${Math.min(village.turnout_percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Voting Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Aktiviti Mengundi Terkini
            </h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">LANGSUNG</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentVotes.length > 0 ? (
              recentVotes.map((vote, index) => (
                <div key={index} className="flex items-center space-x-3 py-2 animate-slide-up">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vote.party_color || '#3b82f6' }}
                  ></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {vote.voter_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vote.village_name} • {vote.party_name}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {timeAgo(vote.voted_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🗳️</div>
                <p>Tiada aktiviti mengundi terkini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Sistem Pilihan Raya Umum Malaysia 2024 • 
          Data dikemaskini secara langsung • 
          Sambungan WebSocket {lastUpdate ? 'Aktif' : 'Tidak Aktif'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;