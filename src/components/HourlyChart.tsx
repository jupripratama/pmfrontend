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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false // Remove chart title since we have card title
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        padding: 10,
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 11
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          },
          padding: 5
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 10
          },
          padding: 8,
          callback: function(value: string | number) {
            if (typeof value === 'number') {
              return value.toLocaleString();
            }
            return value;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
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
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'System Busy',
        data: hourlyData.map(h => h.sysBusy),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Others',
        data: hourlyData.map(h => h.others),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-2">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Call Distribution by Hour</h3>
        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>24-hour overview</span>
        </div>
      </div>
      <div className="h-[300px] sm:h-[350px] lg:h-[400px] xl:h-[450px]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default HourlyChart;