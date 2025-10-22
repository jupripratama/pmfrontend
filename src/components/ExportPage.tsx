import React, { useState } from 'react';
import { Download, FileDown, ArrowLeft, Calendar } from 'lucide-react';
import { callRecordApi } from '../services/api';

interface ExportPageProps {
  onBack: () => void;
}

const ExportPage: React.FC<ExportPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await callRecordApi.exportDailyCsv(selectedDate);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportRangeCSV = async () => {
    setIsExporting(true);
    try {
      await callRecordApi.exportCsv(startDate, endDate);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDailySummary = async () => {
    setIsExporting(true);
    try {
      await callRecordApi.exportDailySummaryExcel(selectedDate);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportOverallSummary = async () => {
    setIsExporting(true);
    try {
      await callRecordApi.exportOverallSummaryExcel(startDate, endDate);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
              <p className="text-gray-600 mt-1">Export call records data in various formats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Date Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Export for Specific Date
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'CSV'}
              </button>
              <button
                onClick={handleExportDailySummary}
                disabled={isExporting}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Export for Date Range
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportRangeCSV}
                disabled={isExporting}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'CSV'}
              </button>
              <button
                onClick={handleExportOverallSummary}
                disabled={isExporting}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Information */}
      <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Export Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">CSV Export</h4>
            <ul className="space-y-1">
              <li>• Raw call records data</li>
              <li>• All columns from database</li>
              <li>• Suitable for data analysis</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Excel Export</h4>
            <ul className="space-y-1">
              <li>• Formatted summary reports</li>
              <li>• Charts and statistics</li>
              <li>• Ready for presentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;