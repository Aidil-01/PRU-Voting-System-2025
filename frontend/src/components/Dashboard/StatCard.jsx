import React from 'react';
import { formatNumber, formatPercentage, getTurnoutStatusColor } from '../../utils/helpers';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  subtitle,
  color = 'blue',
  isPercentage = false,
  isLive = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
  };

  const changeColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const formatValue = (val) => {
    if (isPercentage) {
      return formatPercentage(val);
    }
    return formatNumber(val);
  };

  return (
    <div className={`stat-card relative overflow-hidden ${colorClasses[color]}`}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">LANGSUNG</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </h3>
          
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${iconColorClasses[color]}`}>
              {formatValue(value)}
            </span>
            
            {change !== undefined && (
              <span className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
                {changeType === 'positive' && '+'}
                {formatValue(change)}
                {!isPercentage && changeType !== 'neutral' && (
                  <span className="ml-1">
                    {changeType === 'positive' ? '↗' : '↘'}
                  </span>
                )}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2 rounded-lg bg-white/50 ${iconColorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Progress bar for percentage values */}
      {isPercentage && value > 0 && (
        <div className="mt-3">
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                color === 'green' ? 'bg-green-500' :
                color === 'blue' ? 'bg-blue-500' :
                color === 'yellow' ? 'bg-yellow-500' :
                color === 'red' ? 'bg-red-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized components for different stat types
export const VoterStatCard = ({ totalVoters, votedVoters, isLive = false }) => {
  const percentage = totalVoters > 0 ? (votedVoters / totalVoters) * 100 : 0;
  const remaining = totalVoters - votedVoters;
  
  return (
    <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">LANGSUNG</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Status Pengundi
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(totalVoters)}
              </div>
              <div className="text-xs text-gray-500">Jumlah</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-green-600">
                {formatNumber(votedVoters)}
              </div>
              <div className="text-xs text-gray-500">Mengundi</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-gray-600">
                {formatNumber(remaining)}
              </div>
              <div className="text-xs text-gray-500">Baki</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Peratusan Keluar</span>
            <span className={`text-sm font-semibold ${getTurnoutStatusColor(percentage)}`}>
              {formatPercentage(percentage)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                percentage >= 70 ? 'bg-green-500' :
                percentage >= 50 ? 'bg-yellow-500' :
                percentage >= 30 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TurnoutStatCard = ({ percentage, status, isLive = false }) => {
  const getColor = (perc) => {
    if (perc >= 70) return 'green';
    if (perc >= 50) return 'yellow';
    if (perc >= 30) return 'yellow';
    return 'red';
  };

  return (
    <StatCard
      title="Peratusan Keluar Mengundi"
      value={percentage}
      color={getColor(percentage)}
      isPercentage={true}
      isLive={isLive}
      subtitle={status}
    />
  );
};

export default StatCard;