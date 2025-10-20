import React from 'react';
import { BarChart3, Upload, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Call Analytics</h1>
        <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
          Manage and analyze your call records data efficiently. Upload CSV files, 
          view detailed call statistics, and export reports with ease.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Upload Data</h3>
            <p className="text-gray-600 text-sm">
              Import your call records CSV files to start analyzing data
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-gray-600 text-sm">
              Analyze call patterns, busy hours, and system performance
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <Download className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Export Reports</h3>
            <p className="text-gray-600 text-sm">
              Download detailed reports in CSV and Excel formats
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Upload CSV</h3>
            <p className="text-gray-600 text-sm">Import new call records</p>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-green-500 hover:bg-green-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="text-gray-600 text-sm">Check call statistics</p>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Download className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Export Data</h3>
            <p className="text-gray-600 text-sm">Download in CSV/Excel</p>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-medium text-gray-900">Analytics</h3>
            <p className="text-gray-600 text-sm">View detailed insights</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;