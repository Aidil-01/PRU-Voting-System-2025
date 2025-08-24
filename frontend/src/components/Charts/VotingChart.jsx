import React, { useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { downloadSVG, formatNumber, formatPercentage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VotingChart = ({ data, type = 'bar', title, className = '' }) => {
  const chartRef = useRef(null);

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoPath}`;
  };

  const handleDownloadSVG = () => {
    try {
      const svgElement = chartRef.current?.querySelector('svg');
      if (svgElement) {
        const filename = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.svg`;
        downloadSVG(svgElement, filename);
        toast.success('Chart exported successfully!');
      } else {
        toast.error('Unable to export chart');
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast.error('Error exporting chart');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const logoUrl = getLogoUrl(data.payload.logo_path);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${label} logo`}
                className="w-8 h-8 object-contain rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <p className="font-medium text-gray-900">{label}</p>
          </div>
          <p className="text-sm text-gray-600">
            Undi: <span className="font-semibold text-primary-600">
              {formatNumber(data.value)}
            </span>
          </p>
          {data.payload.percentage !== undefined && (
            <p className="text-sm text-gray-600">
              Peratusan: <span className="font-semibold text-primary-600">
                {formatPercentage(data.payload.percentage)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const logoUrl = getLogoUrl(data.payload.logo_path);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${data.name} logo`}
                className="w-8 h-8 object-contain rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <p className="font-medium text-gray-900">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600">
            Undi: <span className="font-semibold" style={{ color: data.color }}>
              {formatNumber(data.value)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Peratusan: <span className="font-semibold" style={{ color: data.color }}>
              {formatPercentage(data.payload.percentage)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
          stroke="#64748b"
        />
        <YAxis 
          fontSize={12}
          stroke="#64748b"
          tickFormatter={formatNumber}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="vote_count" 
          name="Jumlah Undi"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="vote_count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {entry.payload.name}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  if (!data || data.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Tiada data untuk dipaparkan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={handleDownloadSVG}
          className="btn-secondary flex items-center space-x-1 text-sm"
          title="Export as SVG"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export SVG</span>
        </button>
      </div>
      
      <div ref={chartRef} className="h-96">
        {type === 'bar' ? renderBarChart() : renderPieChart()}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {data.length}
            </div>
            <div className="text-sm text-gray-500">
              {type === 'bar' ? 'Parti' : 'Kategori'}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary-600">
              {formatNumber(data.reduce((sum, item) => sum + (item.vote_count || 0), 0))}
            </div>
            <div className="text-sm text-gray-500">Jumlah Undi</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {data.find(item => item.vote_count === Math.max(...data.map(d => d.vote_count || 0)))?.name || '-'}
            </div>
            <div className="text-sm text-gray-500">Tertinggi</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">
              {formatPercentage(Math.max(...data.map(d => d.percentage || 0)))}
            </div>
            <div className="text-sm text-gray-500">Peratusan Max</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingChart;