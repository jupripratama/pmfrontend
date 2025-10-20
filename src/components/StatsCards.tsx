import React from 'react';
import { Phone, PhoneOff, PhoneMissed, TrendingUp } from 'lucide-react';
import { DailySummary } from '../types/callRecord';

interface StatsCardsProps {
  summary: DailySummary;
}

const StatsCards: React.FC<StatsCardsProps> = ({ summary }) => {
  const stats = [
    {
      title: 'Total Calls',
      value: summary.totalQty.toLocaleString(),
      icon: Phone,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'TE Busy',
      value: `${summary.totalTEBusy.toLocaleString()} (${summary.avgTEBusyPercent}%)`,
      icon: PhoneOff,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'System Busy',
      value: `${summary.totalSysBusy.toLocaleString()} (${summary.avgSysBusyPercent}%)`,
      icon: PhoneMissed,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Others',
      value: `${summary.totalOthers.toLocaleString()} (${summary.avgOthersPercent}%)`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl ${stat.color} text-white mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;