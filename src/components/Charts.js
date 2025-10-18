import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import './Charts.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Charts({ stats, logs }) {
  // Success vs Failed Pie Chart Data
  const pieData = {
    labels: ['Successful', 'Failed'],
    datasets: [
      {
        data: [stats?.successfulAttempts || 0, stats?.failedAttempts || 0],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Access Attempts Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  // Get last 7 days activity
  const getLast7DaysData = () => {
    const days = [];
    const successData = [];
    const failedData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push(dateStr);
      
      // Count attempts for this day
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate <= dayEnd;
      });
      
      successData.push(dayLogs.filter(log => log.success).length);
      failedData.push(dayLogs.filter(log => !log.success).length);
    }
    
    return { days, successData, failedData };
  };

  const { days, successData, failedData } = getLast7DaysData();

  // Line Chart Data
  const lineData = {
    labels: days,
    datasets: [
      {
        label: 'Successful',
        data: successData,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Failed',
        data: failedData,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Access Attempts - Last 7 Days',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Hourly Activity Bar Chart
  const getHourlyActivity = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const activityData = Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      activityData[hour]++;
    });
    
    return { hours, activityData };
  };

  const { hours, activityData } = getHourlyActivity();

  const barData = {
    labels: hours,
    datasets: [
      {
        label: 'Attempts',
        data: activityData,
        backgroundColor: 'rgba(102, 126, 234, 0.7)',
        borderColor: '#667eea',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '24-Hour Activity Pattern',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="charts-container">
      {/* Main Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="charts-row">
        <div className="chart-card full-width">
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="summary-item">
          <div className="summary-icon">📈</div>
          <div className="summary-info">
            <h4>Total Activity</h4>
            <p>{stats?.totalAttempts || 0} attempts recorded</p>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <h4>Success Rate</h4>
            <p>
              {stats?.totalAttempts 
                ? Math.round((stats.successfulAttempts / stats.totalAttempts) * 100) 
                : 0}%
            </p>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">🖥️</div>
          <div className="summary-info">
            <h4>Unique Devices</h4>
            <p>{stats?.uniqueDevices || 0} different systems</p>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">⏰</div>
          <div className="summary-info">
            <h4>Last Activity</h4>
            <p>
              {stats?.lastAttempt?.timestamp 
                ? new Date(stats.lastAttempt.timestamp).toLocaleTimeString()
                : 'No activity'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts;

