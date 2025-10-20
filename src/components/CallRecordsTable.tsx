import React from 'react';
import { Phone, PhoneOff, PhoneMissed, Search } from 'lucide-react';
import { CallRecord } from '../types/callRecord';

interface CallRecordsTableProps {
  records: CallRecord[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading?: boolean;
}

const CallRecordsTable: React.FC<CallRecordsTableProps> = ({ 
  records, 
  searchTerm, 
  onSearchChange, 
  isLoading = false 
}) => {
  const filteredRecords = records.filter(record =>
    record.callCloseReason.toString().includes(searchTerm) ||
    record.callDate.includes(searchTerm) ||
    record.callTime.includes(searchTerm) ||
    getCloseReasonText(record.callCloseReason).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCloseReasonText = (reasonCode: number) => {
    const reasons: { [key: number]: string } = {
      1: 'TE Busy',
      2: 'System Busy',
      3: 'Others'
    };
    return reasons[reasonCode] || `Unknown (${reasonCode})`;
  };

  const getCloseReasonIcon = (reasonCode: number) => {
    const icons: { [key: number]: React.ReactNode } = {
      1: <PhoneOff className="w-4 h-4" />,
      2: <PhoneMissed className="w-4 h-4" />,
      3: <Phone className="w-4 h-4" />
    };
    return icons[reasonCode] || <Phone className="w-4 h-4" />;
  };

  const getCloseReasonColor = (reasonCode: number) => {
    const colors: { [key: number]: string } = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      3: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[reasonCode] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header with Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Call Records
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredRecords.length} records found
            </p>
          </div>
          <div className="mt-3 lg:mt-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reason, date, or time..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Date & Time */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.callDate}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.callTime}
                    </div>
                  </td>

                  {/* Close Reason Code */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {record.callCloseReason}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getCloseReasonColor(record.callCloseReason)}`}>
                        {getCloseReasonIcon(record.callCloseReason)}
                      </div>
                      <span className="text-sm font-medium">
                        {getCloseReasonText(record.callCloseReason)}
                      </span>
                    </div>
                  </td>

                  {/* Hour Group */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Hour {record.hourGroup}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.callCloseReason === 1 
                        ? 'bg-red-100 text-red-800'
                        : record.callCloseReason === 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getCloseReasonText(record.callCloseReason)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Phone className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No call records found</p>
                    <p className="text-sm mt-1">
                      {searchTerm ? 'Try adjusting your search terms' : 'No data available for the selected date'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {filteredRecords.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredRecords.length} of {records.length} records
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>TE Busy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>System Busy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Others</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallRecordsTable;