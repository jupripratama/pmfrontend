import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BarChart3, Upload, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import FileUpload from './FileUpload';
import StatsCards from './StatsCards';
import HourlyChart from './HourlyChart';
import CallRecordsTable from './CallRecordsTable';
import { callRecordApi } from '../services/api';
import { UploadCsvResponse, DailySummary } from '../types/callRecord';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadResult, setUploadResult] = useState<UploadCsvResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load data when date changes
  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const loadData = async (date: string) => {
    setIsLoading(true);
    try {
      const summary = await callRecordApi.getDailySummary(date);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading data:', error);
      setDailySummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (response: UploadCsvResponse) => {
    setUploadResult(response);
    // Reload data after successful upload
    loadData(selectedDate);
  };

  const handleExport = () => {
    callRecordApi.exportCsv(selectedDate, selectedDate);
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Call Records Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.fullName}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {user?.roleName}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-4 flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Data Upload</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {activeTab === 'dashboard' && (
          <div>
            {/* Date Navigation */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatDisplayDate(selectedDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDateChange(-1)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                
                <button
                  onClick={() => handleDateChange(1)}
                  disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : dailySummary ? (
              <>
                <StatsCards summary={dailySummary} />
                <HourlyChart hourlyData={dailySummary.hourlyData} />
                <CallRecordsTable hourlyData={dailySummary.hourlyData} />
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No data available for selected date</p>
                <p className="text-gray-400 text-sm mt-2">
                  Upload a CSV file to see call records data
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Call Records</h2>
              <p className="text-gray-600">
                Upload your CSV file to import call records data into the system
              </p>
            </div>

            <FileUpload onUploadComplete={handleUploadComplete} />
            
            {/* Upload Results */}
            {uploadResult && (
              <div className={`mt-8 p-6 rounded-lg border ${
                uploadResult.successfulRecords > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  uploadResult.successfulRecords > 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.successfulRecords > 0 ? 'Upload Successful!' : 'Upload Completed with Issues'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className={`p-3 rounded ${
                    uploadResult.successfulRecords > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className="font-semibold">Successful Records</div>
                    <div className="text-2xl font-bold">{uploadResult.successfulRecords.toLocaleString()}</div>
                  </div>
                  
                  {uploadResult.failedRecords > 0 && (
                    <div className="bg-red-100 text-red-800 p-3 rounded">
                      <div className="font-semibold">Failed Records</div>
                      <div className="text-2xl font-bold">{uploadResult.failedRecords.toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div className="bg-blue-100 text-blue-800 p-3 rounded">
                    <div className="font-semibold">Total Processed</div>
                    <div className="text-2xl font-bold">{uploadResult.totalRecords.toLocaleString()}</div>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                    <div className="bg-red-100 rounded p-3 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-red-700 text-sm py-1">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;