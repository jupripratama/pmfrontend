import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { HourlySummary } from '../types/callRecord';

interface HourlySummaryTableProps {
  hourlyData: HourlySummary[];
}

const HourlySummaryTable: React.FC<HourlySummaryTableProps> = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hourly data found for selected date</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Hourly Summary ({hourlyData.length} hours)
        </h3>
      </div>
      
      {/* Container dengan overflow yang lebih baik */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Time
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Total
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                TE Busy
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                TE %
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Sys Busy
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Sys %
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Others
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Others %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hourlyData.map((hourData, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-xs font-semibold text-gray-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {hourData.timeRange}
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-gray-900">
                  {hourData.qty.toLocaleString()}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-red-600">
                  {hourData.teBusy.toLocaleString()}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold text-red-600">
                  {hourData.teBusyPercent.toFixed(1)}%
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-yellow-600">
                  {hourData.sysBusy.toLocaleString()}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold text-yellow-600">
                  {hourData.sysBusyPercent.toFixed(1)}%
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-green-600">
                  {hourData.others.toLocaleString()}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold text-green-600">
                  {hourData.othersPercent.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info untuk mobile */}
      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200 lg:hidden">
        <div className="text-xs text-blue-700 text-center">
          Scroll horizontally to view all columns
        </div>
      </div>
    </div>
  );
};

export default HourlySummaryTable;