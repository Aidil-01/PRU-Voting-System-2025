// Format Malaysian IC number (123456-78-9012)
export const formatICNumber = (ic) => {
  if (!ic) return '';
  const cleaned = ic.replace(/\D/g, '');
  if (cleaned.length !== 12) return ic;
  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
};

// Validate Malaysian IC number
export const validateICNumber = (ic) => {
  const cleaned = ic.replace(/\D/g, '');
  return /^\d{12}$/.test(cleaned);
};

// Format date for Malaysian locale
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

// Format datetime for Malaysian locale
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format time only
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-MY');
};

// Generate random color for parties
export const generateRandomColor = () => {
  const colors = [
    '#1E40AF', '#DC2626', '#16A34A', '#7C2D12',
    '#2563EB', '#059669', '#B45309', '#7C3AED',
    '#BE123C', '#0F766E', '#A16207', '#6D28D9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Validate hex color
export const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Calculate turnout percentage
export const calculateTurnout = (votedCount, totalCount) => {
  if (!totalCount || totalCount === 0) return 0;
  return (votedCount / totalCount) * 100;
};

// Get turnout status color
export const getTurnoutStatusColor = (percentage) => {
  if (percentage >= 70) return 'text-green-600';
  if (percentage >= 50) return 'text-yellow-600';
  if (percentage >= 30) return 'text-orange-600';
  return 'text-red-600';
};

// Get turnout status text
export const getTurnoutStatus = (percentage) => {
  if (percentage >= 70) return 'Tinggi';
  if (percentage >= 50) return 'Sederhana';
  if (percentage >= 30) return 'Rendah';
  return 'Sangat Rendah';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Download file
export const downloadFile = (content, filename, contentType = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      let cell = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};

// Sort array of objects by key
export const sortByKey = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    
    // Handle null/undefined values
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Convert to string for comparison if needed
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
    }
    if (typeof bVal === 'string') {
      bVal = bVal.toLowerCase();
    }
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

// Filter array of objects by search term
export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

// Generate chart colors based on party colors
export const generateChartColors = (parties) => {
  return parties.map(party => party.color || generateRandomColor());
};

// Convert SVG to downloadable file
export const downloadSVG = (svgElement, filename) => {
  if (!svgElement) return;
  
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Time ago helper
export const timeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Sebentar tadi';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return formatDate(date);
};

// Malaysian election terms
export const electionTerms = {
  'Pilihan Raya Umum': 'General Election',
  'Pengundi': 'Voter',
  'Undi': 'Vote',
  'Parti': 'Party',
  'Kampung': 'Village',
  'Peratusan Keluar Mengundi': 'Voter Turnout',
  'Statistik': 'Statistics',
  'Keputusan': 'Results',
  'Masa Mengundi': 'Voting Time',
  'Jumlah Undi': 'Total Votes',
  'Baki Pengundi': 'Remaining Voters',
};