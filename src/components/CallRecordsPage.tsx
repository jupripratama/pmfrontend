import React, { useState, useEffect } from 'react';
import { Calendar, Download, Upload, Search, Filter, FileDown, Trash2, BarChart3 } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { CallRecord, DailySummary } from '../types/callRecord';
import HourlyChart from './HourlyChart';
import HourlySummaryTable from './HourlySummaryTable'; // Import yang baru

const CallRecordsPage: React.FC = () => {
  // ... semua state dan fungsi tetap sama ...

  return (
    <div className="space-y-6">
      {/* ... semua kode sebelumnya tetap sama ... */}

      {/* Content Sections */}
      {activeSection === 'records' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Call Records Data ({filteredRecords.length} records)
              </h3>
              <div className="mt-2 lg:mt-0 flex space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
                  />
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hour Group
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.callDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.callTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.callCloseReason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          record.callCloseReason === 1 
                            ? 'bg-red-100 text-red-800'
                            : record.callCloseReason === 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getCloseReasonText(record.callCloseReason)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.hourGroup}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No call records found for selected date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'summary' && dailySummary && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-500 text-white mr-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{dailySummary.totalQty.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-red-500 text-white mr-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">TE Busy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dailySummary.totalTEBusy.toLocaleString()} ({dailySummary.avgTEBusyPercent}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-500 text-white mr-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">System Busy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dailySummary.totalSysBusy.toLocaleString()} ({dailySummary.avgSysBusyPercent}%)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-500 text-white mr-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Others</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dailySummary.totalOthers.toLocaleString()} ({dailySummary.avgOthersPercent}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Chart */}
          {dailySummary.hourlyData && dailySummary.hourlyData.length > 0 && (
            <HourlyChart hourlyData={dailySummary.hourlyData} />
          )}

          {/* Hourly Summary Table - GUNAKAN HourlySummaryTable BUKAN CallRecordsTable */}
          {dailySummary.hourlyData && dailySummary.hourlyData.length > 0 && (
            <HourlySummaryTable hourlyData={dailySummary.hourlyData} />
          )}
        </div>
      )}

      {activeSection === 'summary' && !dailySummary && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No summary data available for selected date</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload a CSV file to see hourly summary and charts
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function
const getCloseReasonText = (reasonCode: number) => {
  const reasons: { [key: number]: string } = {
    1: 'TE Busy',
    2: 'System Busy',
    3: 'Others'
  };
  return reasons[reasonCode] || `Unknown (${reasonCode})`;
};

export default CallRecordsPage;