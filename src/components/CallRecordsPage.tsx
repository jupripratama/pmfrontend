import React, { useState, useEffect } from 'react';
import { Calendar, Download, Search, Filter, FileDown, Trash2, BarChart3, Phone, PhoneOff, PhoneMissed, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { CallRecord, DailySummary } from '../types/callRecord';
import HourlyChart from './HourlyChart';
import HourlySummaryTable from './HourlySummaryTable';

// Interface untuk DebugInfo
interface DebugInfo {
  selectedDate: string;
  recordsCount: number;
  sampleRecord: CallRecord | null;
  allRecords: CallRecord[];
  timestamp: string;
  apiResponse?: any;
  error?: string;
  errorDetails?: any;
}

const CallRecordsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'records' | 'summary'>('records');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [filterReason, setFilterReason] = useState<'all' | 1 | 2 | 3>('all');
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Load user data and permissions on component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const permissionsStr = localStorage.getItem('permissions');
    
    console.log('🔐 Raw user data:', userStr);
    console.log('🔑 Raw permissions data:', permissionsStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 User role:', user.roleName);
        setUserRole(user.roleName || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserRole('');
      }
    }
    
    if (permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr);
        console.log('✅ Loaded permissions:', permissions);
        setUserPermissions(permissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
        setUserPermissions([]);
      }
    }
  }, []);

  // Load data when selected date changes
  useEffect(() => {
    console.log('🔄 Loading data for date:', selectedDate);
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadCallRecords(),
        loadDailySummary()
      ]);
    } catch (err) {
      console.error('❌ Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCallRecords = async () => {
    try {
      console.log(`📡 Loading call records for: ${selectedDate}`);
      const data = await callRecordApi.getCallRecords(selectedDate, selectedDate);
      
      console.log(`✅ Loaded ${data.length} records`);
      
      const newDebugInfo: DebugInfo = {
        selectedDate,
        recordsCount: data.length,
        sampleRecord: data[0] || null,
        allRecords: data,
        timestamp: new Date().toISOString(),
        apiResponse: data
      };
      
      setDebugInfo(newDebugInfo);
      setRecords(data);
    } catch (error: any) {
      console.error('❌ Error loading call records:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      const errorDebugInfo: DebugInfo = {
        selectedDate,
        recordsCount: 0,
        sampleRecord: null,
        allRecords: [],
        timestamp: new Date().toISOString(),
        error: errorMessage,
        errorDetails: error.response?.data
      };
      
      setDebugInfo(errorDebugInfo);
      setError(`Failed to load call records: ${errorMessage}`);
      setRecords([]);
    }
  };

  const loadDailySummary = async () => {
    try {
      console.log(`📡 Loading daily summary for: ${selectedDate}`);
      const summary = await callRecordApi.getDailySummary(selectedDate);
      console.log('✅ Daily summary loaded:', summary);
      setDailySummary(summary);
    } catch (error: any) {
      console.error('❌ Error loading daily summary:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to load daily summary: ${errorMessage}`);
      setDailySummary(null);
    }
  };

  // Check permissions
  const hasDeletePermission = userPermissions.includes('callrecord.delete');
  const canViewDetail = userPermissions.includes('callrecord.view') || userPermissions.includes('callrecord.view-any');
  const canExportCSV = userPermissions.includes('callrecord.export-csv');
  const canExportExcel = userPermissions.includes('callrecord.export-excel');

  console.log('🔍 Permission Check:', {
    hasDeletePermission,
    canViewDetail, 
    canExportCSV,
    canExportExcel,
    totalPermissions: userPermissions.length
  });

  // Search and filter function
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      searchTerm === '' ||
      record.callCloseReason.toString().includes(searchTerm) ||
      record.callDate.includes(searchTerm) ||
      record.callTime.includes(searchTerm) ||
      (record.closeReasonDescription && record.closeReasonDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getCloseReasonText(record.callCloseReason).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason = 
      filterReason === 'all' || 
      record.callCloseReason === filterReason;

    return matchesSearch && matchesReason;
  });

  // Export functions
  const handleExportCSV = () => {
    callRecordApi.exportDailyCsv(selectedDate);
  };

  const handleExportRangeCSV = () => {
    callRecordApi.exportCsv(startDate, endDate);
  };

  const handleExportDailySummary = () => {
    callRecordApi.exportDailySummaryExcel(selectedDate);
  };

  const handleExportOverallSummary = () => {
    callRecordApi.exportOverallSummaryExcel(startDate, endDate);
  };

  const handleDeleteRecords = async () => {
    console.log('🗑️ DELETE DEBUG =================');
    console.log('User Role:', userRole);
    console.log('User Permissions:', userPermissions);
    console.log('Has Delete Permission:', hasDeletePermission);
    console.log('Records Count:', records.length);
    console.log('Selected Date:', selectedDate);
    console.log('==============================');

    // Permission check
    if (!hasDeletePermission) {
      alert('Access denied: You do not have permission to delete call records. Required permission: callrecord.delete');
      return;
    }

    if (records.length === 0) {
      alert('No records to delete for selected date');
      return;
    }

    if (window.confirm(`Are you sure you want to delete all ${records.length} call records for ${selectedDate}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        console.log('🔄 Sending delete request...');
        
        const success = await callRecordApi.deleteCallRecords(selectedDate);
        console.log('✅ Delete API returned:', success);
        
        if (success) {
          alert(`Successfully deleted ${records.length} records for ${selectedDate}`);
          setRecords([]);
          setDailySummary(null);
          
          // Update debug info
          setDebugInfo((prev: DebugInfo | null) => prev ? {
            ...prev,
            recordsCount: 0,
            sampleRecord: null,
            allRecords: [],
            timestamp: new Date().toISOString()
          } : null);
        } else {
          alert('Delete operation failed - no records were deleted');
        }
      } catch (error: any) {
        console.error('❌ Delete error details:', error);
        // Error message sudah dihandle di API
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCloseReasonText = (reasonCode: number) => {
    const reasons: { [key: number]: string } = {
      1: 'TE Busy',
      2: 'System Busy',
      3: 'Others'
    };
    return reasons[reasonCode] || `Unknown (${reasonCode})`;
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

  const refreshData = () => {
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Debug Info Panel */}
      {debugInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Info className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-800">Debug Information</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="font-semibold text-gray-600">Selected Date</div>
              <div className="text-gray-800">{debugInfo.selectedDate}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-semibold text-gray-600">Records Loaded</div>
              <div className={`font-bold ${debugInfo.recordsCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {debugInfo.recordsCount} records
              </div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-semibold text-gray-600">User Role</div>
              <div className={`font-bold ${
                userRole === 'Super Admin' ? 'text-purple-600' : 
                'text-gray-600'
              }`}>
                {userRole || 'Not logged in'}
              </div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-semibold text-gray-600">Delete Permission</div>
              <div className={`font-bold ${hasDeletePermission ? 'text-green-600' : 'text-red-600'}`}>
                {hasDeletePermission ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {showDebug && (
            <div className="mt-3 space-y-2">
              {debugInfo.sampleRecord && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="font-semibold text-yellow-800 mb-2">Sample Record:</div>
                  <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.sampleRecord, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugInfo.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="font-semibold text-red-800 mb-2">Error:</div>
                  <div className="text-xs text-red-700">{debugInfo.error}</div>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <div className="font-semibold text-purple-800 mb-2">User Permissions ({userPermissions.length}):</div>
                <div className="text-xs text-purple-700 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1">
                    {userPermissions.map((permission, index) => (
                      <div key={index} className={`px-2 py-1 rounded text-xs ${
                        permission.includes('callrecord.delete') ? 'bg-green-100 text-green-800 font-bold border border-green-300' :
                        permission.includes('callrecord.') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
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

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Records</h1>
            <p className="text-gray-600 mt-1">
              Data for: <span className="font-semibold text-blue-600">{formatDisplayDate(selectedDate)}</span>
              {userRole && (
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  userRole === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Role: {userRole}
                </span>
              )}
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-blue-700"
              />
            </div>
            
            <button 
              onClick={handleDeleteRecords}
              disabled={records.length === 0 || !hasDeletePermission || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                hasDeletePermission 
                  ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              title={
                !hasDeletePermission 
                  ? `Missing permission: callrecord.delete` 
                  : records.length === 0 
                    ? 'No records to delete' 
                    : 'Delete all records for selected date'
              }
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Deleting...' : 'Delete Records'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveSection('records')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'records'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📋 Call Records ({records.length})
          </button>
          
          <button
            onClick={() => setActiveSection('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'summary'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📊 Daily Summary & Charts
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Export for {selectedDate}</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleExportCSV}
                disabled={records.length === 0 || !canExportCSV}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                title={!canExportCSV ? 'No permission to export CSV' : ''}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={handleExportDailySummary}
                disabled={!dailySummary || !canExportExcel}
                className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                title={!canExportExcel ? 'No permission to export Excel' : ''}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Export for Date Range</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportRangeCSV}
                  disabled={!canExportCSV}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                  title={!canExportCSV ? 'No permission to export CSV' : ''}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportOverallSummary}
                  disabled={!canExportExcel}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                  title={!canExportExcel ? 'No permission to export Excel' : ''}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'records' && (
        <CallRecordsSection 
          records={filteredRecords}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterReason={filterReason}
          onFilterChange={setFilterReason}
          totalRecords={records.length}
        />
      )}

      {activeSection === 'summary' && (
        <SummarySection 
          dailySummary={dailySummary}
          isLoading={isLoading}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

// Sub-component for Records Section
const CallRecordsSection: React.FC<{
  records: CallRecord[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterReason: 'all' | 1 | 2 | 3;
  onFilterChange: (reason: 'all' | 1 | 2 | 3) => void;
  totalRecords: number;
}> = ({ records, isLoading, searchTerm, onSearchChange, filterReason, onFilterChange, totalRecords }) => {
  const getCloseReasonText = (reasonCode: number) => {
    const reasons: { [key: number]: string } = {
      1: 'TE Busy',
      2: 'System Busy',
      3: 'Others'
    };
    return reasons[reasonCode] || `Unknown (${reasonCode})`;
  };

  // Statistics for filter badges
  const teBusyCount = records.filter(r => r.callCloseReason === 1).length;
  const systemBusyCount = records.filter(r => r.callCloseReason === 2).length;
  const othersCount = records.filter(r => r.callCloseReason === 3).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600">{teBusyCount}</div>
          <div className="text-sm text-gray-600">TE Busy</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-yellow-600">{systemBusyCount}</div>
          <div className="text-sm text-gray-600">System Busy</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">{othersCount}</div>
          <div className="text-sm text-gray-600">Others</div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Call Records Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {records.length} of {totalRecords} records
                {searchTerm && ` • Searching for "${searchTerm}"`}
                {filterReason !== 'all' && ` • Filtered by ${getCloseReasonText(filterReason)}`}
              </p>
            </div>
            <div className="mt-2 lg:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reason, date, or time..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-sm"
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterReason}
                  onChange={(e) => onFilterChange(e.target.value as 'all' | 1 | 2 | 3)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="all">All Reasons</option>
                  <option value={1}>TE Busy</option>
                  <option value={2}>System Busy</option>
                  <option value={3}>Others</option>
                </select>
                <Filter className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hour Group</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-500">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{record.callDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{record.callTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50 rounded">
                      {record.callCloseReason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                        record.callCloseReason === 1 ? 'bg-red-100 text-red-800 border-red-200' :
                        record.callCloseReason === 2 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {getCloseReasonText(record.callCloseReason)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        Hour {record.hourGroup}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Phone className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No call records found</p>
                      <p className="text-sm text-gray-600 max-w-md">
                        {searchTerm || filterReason !== 'all' 
                          ? 'No records match your search or filter criteria.' 
                          : 'No data available for the selected date.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Summary Section
const SummarySection: React.FC<{
  dailySummary: DailySummary | null;
  isLoading: boolean;
  selectedDate: string;
}> = ({ dailySummary, isLoading, selectedDate }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-500">Loading summary data...</span>
        </div>
      </div>
    );
  }

  if (!dailySummary) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No summary data available</p>
        <p className="text-gray-400 text-sm mt-2">Select a date with data to view summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Calls"
          value={dailySummary.totalQty.toLocaleString()}
          icon={Phone}
          color="blue"
          description="Total call attempts"
        />
        <StatCard
          title="TE Busy"
          value={`${dailySummary.totalTEBusy.toLocaleString()} (${dailySummary.avgTEBusyPercent}%)`}
          icon={PhoneOff}
          color="red"
          description="Terminal Equipment busy"
        />
        <StatCard
          title="System Busy"
          value={`${dailySummary.totalSysBusy.toLocaleString()} (${dailySummary.avgSysBusyPercent}%)`}
          icon={PhoneMissed}
          color="yellow"
          description="System capacity busy"
        />
        <StatCard
          title="Others"
          value={`${dailySummary.totalOthers.toLocaleString()} (${dailySummary.avgOthersPercent}%)`}
          icon={TrendingUp}
          color="green"
          description="Other call outcomes"
        />
      </div>

      {/* Hourly Chart */}
      {dailySummary.hourlyData && dailySummary.hourlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Distribution by Hour</h3>
          <HourlyChart hourlyData={dailySummary.hourlyData} />
        </div>
      )}

      {/* Hourly Summary Table */}
      {dailySummary.hourlyData && dailySummary.hourlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Detailed Summary</h3>
          <HourlySummaryTable hourlyData={dailySummary.hourlyData} />
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
  color: 'blue' | 'red' | 'yellow' | 'green';
  description: string;
}> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500', 
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  const textColors = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700'
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

export default CallRecordsPage;