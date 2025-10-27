import React, { useState, useEffect } from 'react';
import { Calendar, Users, Phone, Clock, TrendingUp, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { FleetStatisticsDto, FleetStatisticType, TopCallerFleetDto, TopCalledFleetDto } from '../types/callRecord';

const FleetStatisticsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [topCount, setTopCount] = useState<number>(10);
  const [statisticType, setStatisticType] = useState<FleetStatisticType>(FleetStatisticType.All);
  const [statistics, setStatistics] = useState<FleetStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

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

  // Handler untuk button type
  const handleTypeChange = (type: FleetStatisticType) => {
    setStatisticType(type);
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 shadow-sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section - IMPROVED DESIGN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Header */}
        <div 
          className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 mr-3">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Settings</h2>
                <p className="text-sm text-gray-600">Customize your statistics view</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-3">
                {isFilterExpanded ? 'Collapse' : 'Expand'}
              </span>
              {isFilterExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {/* Filter Content */}
        {isFilterExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Filter - IMPROVED */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {formatDisplayDate(selectedDate)}
                </p>
              </div>

              {/* Top Count Filter - IMPROVED */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  Top Records
                </label>
                <div className="relative">
                  <select
                    value={topCount}
                    onChange={(e) => setTopCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all shadow-sm hover:border-gray-400 bg-white"
                  >
                    <option value={5}>Top 5 Records</option>
                    <option value={10}>Top 10 Records</option>
                    <option value={20}>Top 20 Records</option>
                    <option value={50}>Top 50 Records</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Display top {topCount} performing fleets
                </p>
              </div>

              {/* Type Filter - IMPROVED Button Group */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-green-500" />
                  Statistics Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTypeChange(FleetStatisticType.All)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg transition-all flex flex-col items-center justify-center ${
                      statisticType === FleetStatisticType.All
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
                    }`}
                  >
                    <span>All</span>
                  </button>
                  <button
                    onClick={() => handleTypeChange(FleetStatisticType.Caller)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg transition-all flex flex-col items-center justify-center ${
                      statisticType === FleetStatisticType.Caller
                        ? 'bg-green-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
                    }`}
                  >
                    <span>Top Caller</span>
                  </button>
                  <button
                    onClick={() => handleTypeChange(FleetStatisticType.Called)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg transition-all flex flex-col items-center justify-center ${
                      statisticType === FleetStatisticType.Called
                        ? 'bg-purple-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
                    }`}
                  >
                    <span>Top Called</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {statisticType === FleetStatisticType.All && 'Showing all statistics'}
                  {statisticType === FleetStatisticType.Caller && 'Focusing on callers'}
                  {statisticType === FleetStatisticType.Called && 'Focusing on called fleets'}
                </p>
              </div>
            </div>

            {/* Quick Stats Preview */}
            {statistics && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Preview</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-700">{statistics.totalCallsInDay.toLocaleString()}</div>
                    <div className="text-xs text-blue-600">Total Calls</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-700">{statistics.totalUniqueCallers.toLocaleString()}</div>
                    <div className="text-xs text-purple-600">Unique Callers</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-orange-700">{statistics.totalUniqueCalledFleets.toLocaleString()}</div>
                    <div className="text-xs text-orange-600">Unique Called</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* Overall Statistics - IMPROVED */}
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
          {/* <StatCard
            title="Avg. Duration"
            value={statistics.totalDurationInDayFormatted}
            icon={Clock}
            color="green"
            description="Average call duration"
          /> */}
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

      {/* Rest of your existing table components remain the same */}
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

// IMPROVED StatCard Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, description, trend }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600'
  };

  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700'
  };

  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {trend && (
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <p className={`text-2xl font-bold ${textColors[color]} mb-2`}>{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default FleetStatisticsPage;