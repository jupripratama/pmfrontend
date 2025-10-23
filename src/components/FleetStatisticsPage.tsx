import React, { useState, useEffect } from 'react';
import { Calendar, Users, Phone, Clock, TrendingUp, Filter, Download } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { FleetStatisticsDto, FleetStatisticType, TopCallerFleetDto, TopCalledFleetDto } from '../types/callRecord';

const FleetStatisticsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [topCount, setTopCount] = useState<number>(10);
  const [statisticType, setStatisticType] = useState<FleetStatisticType>(FleetStatisticType.All);
  const [statistics, setStatistics] = useState<FleetStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFleetStatistics();
  }, [selectedDate, topCount, statisticType]);

  const loadFleetStatistics = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('🔄 Loading fleet statistics...', { selectedDate, topCount, statisticType });
      const data = await callRecordApi.getFleetStatistics(selectedDate, topCount, statisticType);
      setStatistics(data);
    } catch (err: any) {
      console.error('❌ Error loading fleet statistics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load fleet statistics');
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return date;
    }
  };

  const getTypeDescription = () => {
    switch (statisticType) {
      case FleetStatisticType.Caller:
        return 'Top Caller Fleets';
      case FleetStatisticType.Called:
        return 'Top Called Fleets';
      default:
        return 'Fleet Statistics';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fleet Statistics</h1>
            <p className="text-gray-600 mt-1">
              Analyze top caller and called fleet performance
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
            <button
              onClick={loadFleetStatistics}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Top Count Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Top Records
            </label>
            <select
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Statistics Type
            </label>
            <select
              value={statisticType}
              onChange={(e) => setStatisticType(e.target.value as FleetStatisticType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={FleetStatisticType.All}>All Statistics</option>
              <option value={FleetStatisticType.Caller}>Top Callers Only</option>
              <option value={FleetStatisticType.Called}>Top Called Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-700 font-medium">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Calls"
            value={statistics.totalCallsInDay.toLocaleString()}
            icon={Phone}
            color="blue"
            description="Total calls for the day"
          />
          <StatCard
            title="Total Duration"
            value={statistics.totalDurationInDayFormatted}
            icon={Clock}
            color="green"
            description="Total call duration"
          />
          <StatCard
            title="Unique Callers"
            value={statistics.totalUniqueCallers.toLocaleString()}
            icon={Users}
            color="purple"
            description="Unique caller fleets"
          />
          <StatCard
            title="Unique Called"
            value={statistics.totalUniqueCalledFleets.toLocaleString()}
            icon={Users}
            color="orange"
            description="Unique called fleets"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-500">Loading fleet statistics...</span>
          </div>
        </div>
      )}

      {/* Top Callers Section */}
      {statistics && (statisticType === FleetStatisticType.All || statisticType === FleetStatisticType.Caller) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Caller Fleets
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Fleets that initiated the most calls on {formatDisplayDate(selectedDate)}
            </p>
          </div>

          {statistics.topCallers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller Fleet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.topCallers.map((caller) => (
                    <tr key={caller.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          caller.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          caller.rank === 2 ? 'bg-gray-100 text-gray-800' :
                          caller.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          #{caller.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caller.callerFleet}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {caller.totalCalls.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {caller.totalDurationFormatted}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {caller.averageDurationFormatted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No caller data available</p>
              <p className="text-sm text-gray-600">No top caller statistics found for the selected date and filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Top Called Fleets Section */}
      {statistics && (statisticType === FleetStatisticType.All || statisticType === FleetStatisticType.Called) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Top Called Fleets
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Fleets that received the most calls on {formatDisplayDate(selectedDate)}
            </p>
          </div>

          {statistics.topCalledFleets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Called Fleet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Callers</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.topCalledFleets.map((called) => (
                    <tr key={called.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          called.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          called.rank === 2 ? 'bg-gray-100 text-gray-800' :
                          called.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          #{called.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {called.calledFleet}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {called.totalCalls.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {called.totalDurationFormatted}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {called.averageDurationFormatted}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {called.uniqueCallers} callers
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No called fleet data available</p>
              <p className="text-sm text-gray-600">No top called fleet statistics found for the selected date and filters.</p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !statistics && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No fleet statistics available</p>
          <p className="text-gray-400 text-sm mt-2">Select a date with data to view fleet statistics</p>
        </div>
      )}
    </div>
  );
};

// Reusable StatCard Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
}> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColors[color]} mb-2`}>{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} text-white shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default FleetStatisticsPage;