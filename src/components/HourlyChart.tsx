import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HourlySummary } from '../types/callRecord';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HourlyChartProps {
  hourlyData: HourlySummary[];
}

const HourlyChart: React.FC<HourlyChartProps> = ({ hourlyData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Call Distribution by Hour',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Calls',
        },
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels: hourlyData.map(h => h.timeRange),
    datasets: [
      {
        label: 'TE Busy',
        data: hourlyData.map(h => h.teBusy),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'System Busy',
        data: hourlyData.map(h => h.sysBusy),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
      {
        label: 'Others',
        data: hourlyData.map(h => h.others),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Bar options={options} data={data} />
    </div>
  );
};

export default HourlyChart;