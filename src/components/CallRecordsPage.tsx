import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  FileDown, 
  Trash2, 
  BarChart3, 
  Phone, 
  PhoneOff, 
  PhoneMissed, 
  TrendingUp, 
  AlertCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { callRecordApi } from '../services/api';
import { CallRecord, CallRecordsResponse, DailySummary } from '../types/callRecord';
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

// Interface untuk Query Params
interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  callCloseReason?: number;
  hourGroup?: number;
  sortBy: string;
  sortDir: string;
}

const CallRecordsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordsResponse, setRecordsResponse] = useState<CallRecordsResponse | null>(null);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'records' | 'summary'>('records');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Query parameters state
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 15,
    search: '',
    callCloseReason: undefined,
    hourGroup: undefined,
    sortBy: 'calldate',
    sortDir: 'desc'
  });

  // Filter state
  const [filterReason, setFilterReason] = useState<'all' | number>('all');
  const [filterHour, setFilterHour] = useState<'all' | number>('all');
  const [showDebug, setShowDebug] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load user data and permissions on component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const permissionsStr = localStorage.getItem('permissions');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.roleName || '');
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserRole('');
      }
    }
    
    if (permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr);
        setUserPermissions(permissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
        setUserPermissions([]);
      }
    }
  }, []);

  // Load data when selected date or query params change
  useEffect(() => {
    console.log('🔄 Loading data for date:', selectedDate, 'with params:', queryParams);
    loadData();
  }, [selectedDate, queryParams]);

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
      console.log(`📡 Loading call records with params:`, {
        startDate: selectedDate,
        endDate: selectedDate,
        ...queryParams
      });

      const response = await callRecordApi.getCallRecords(
        selectedDate, 
        selectedDate, 
        queryParams.page, 
        queryParams.pageSize,
        queryParams.search,
        queryParams.callCloseReason,
        queryParams.hourGroup,
        queryParams.sortBy,
        queryParams.sortDir
      );
      
      console.log(`✅ Loaded ${response.data.data.length} records out of ${response.data.totalCount} total`);
      
      const newDebugInfo: DebugInfo = {
        selectedDate,
        recordsCount: response.data.data.length,
        sampleRecord: response.data.data[0] || null,
        allRecords: response.data.data,
        timestamp: new Date().toISOString(),
        apiResponse: response
      };
      
      setDebugInfo(newDebugInfo);
      setRecordsResponse(response);
      setRecords(response.data.data);
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
      setRecordsResponse(null);
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

  // Handler untuk search
  const handleSearch = (searchTerm: string) => {
    setQueryParams(prev => ({
      ...prev,
      search: searchTerm,
      page: 1 // Reset ke page 1 saat search
    }));
  };

  // Handler untuk filter reason
  const handleFilterReason = (reason: 'all' | number) => {
    setFilterReason(reason);
    setQueryParams(prev => ({
      ...prev,
      callCloseReason: reason === 'all' ? undefined : reason,
      page: 1 // Reset ke page 1 saat filter
    }));
  };

  // Handler untuk filter hour
  const handleFilterHour = (hour: 'all' | number) => {
    setFilterHour(hour);
    setQueryParams(prev => ({
      ...prev,
      hourGroup: hour === 'all' ? undefined : hour,
      page: 1 // Reset ke page 1 saat filter
    }));
  };

  // Handler untuk sorting
  const handleSort = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  // Handler untuk pagination
  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    if (!hasDeletePermission) {
      alert('Access denied: You do not have permission to delete call records. Required permission: callrecord.delete');
      return;
    }

    if (records.length === 0) {
      alert('No records to delete for selected date');
      return;
    }

    if (window.confirm(`Are you sure you want to delete all call records for ${selectedDate}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        console.log('🔄 Sending delete request...');
        
        const success = await callRecordApi.deleteCallRecords(selectedDate);
        console.log('✅ Delete API returned:', success);
        
        if (success) {
          alert(`Successfully deleted records for ${selectedDate}`);
          setRecords([]);
          setRecordsResponse(null);
          setDailySummary(null);
          
          setDebugInfo(prev => prev ? {
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper function untuk mendapatkan close reason text
  const getCloseReasonText = (reasonCode: number) => {
    const reasons: { [key: number]: string } = {
      0: 'TE Busy',
      1: 'System Busy',
      2: 'No Answer',
      3: 'Not Found',
      4: 'Complete',
      5: 'Preempted',
      6: 'Timeout',
      7: 'Inactive',
      8: 'Callback',
      9: 'Unsupported Request',
      10: 'Invalid Call'
    };
    return reasons[reasonCode] || `Unknown (${reasonCode})`;
  };

  const getCloseReasonDescription = (reasonCode: number) => {
    const descriptions: { [key: number]: string } = {
      0: 'The called terminal equipment is already in a call',
      1: 'The network is overloaded or has problems',
      2: 'The called party does not answer',
      3: 'The ident of the called party is valid but it is either not registered or the node could not route the call',
      4: 'The call was completed',
      5: 'The call was cleared down to make a channel available for a priority or emergency call',
      6: 'The call exceeded the current maximum call duration or the maximum allowable call setup time',
      7: 'One or more of the parties was inactive. The inactivity timer expired',
      8: 'The call to a line dispatcher terminal was put in the callback queue',
      9: 'The call could not be processed because the system does not support it',
      10: 'The call failed the node\'s validation check'
    };
    return descriptions[reasonCode] || 'Unknown reason';
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

  // Statistics untuk filter badges
  const totalRecords = recordsResponse?.data?.totalCount || 0;
  const currentPage = recordsResponse?.data?.page || 1;
  const totalPages = recordsResponse?.data?.totalPages || 1;
  const hasNext = recordsResponse?.data?.hasNext || false;
  const hasPrevious = recordsResponse?.data?.hasPrevious || false;

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
              <div className="font-semibold text-gray-600">Total Records</div>
              <div className="font-bold text-blue-600">{totalRecords.toLocaleString()}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="font-semibold text-gray-600">Current Page</div>
              <div className="font-bold text-purple-600">{currentPage} of {totalPages}</div>
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
            📋 Call Records ({totalRecords.toLocaleString()})
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
          records={records}
          recordsResponse={recordsResponse}
          isLoading={isLoading}
          searchTerm={queryParams.search}
          onSearchChange={handleSearch}
          filterReason={filterReason}
          onFilterReasonChange={handleFilterReason}
          filterHour={filterHour}
          onFilterHourChange={handleFilterHour}
          sortBy={queryParams.sortBy}
          sortDir={queryParams.sortDir}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={handlePageChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          getCloseReasonText={getCloseReasonText}
          getCloseReasonDescription={getCloseReasonDescription}
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
  recordsResponse: CallRecordsResponse | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterReason: 'all' | number;
  onFilterReasonChange: (reason: 'all' | number) => void;
  filterHour: 'all' | number;
  onFilterHourChange: (hour: 'all' | number) => void;
  sortBy: string;
  sortDir: string;
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  getCloseReasonText: (reasonCode: number) => string;
  getCloseReasonDescription: (reasonCode: number) => string;
}> = ({ 
  records, 
  recordsResponse, 
  isLoading, 
  searchTerm, 
  onSearchChange,
  filterReason,
  onFilterReasonChange,
  filterHour,
  onFilterHourChange,
  sortBy,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  showFilters,
  onToggleFilters,
  getCloseReasonText,
  getCloseReasonDescription
}) => {
  const totalRecords = recordsResponse?.data?.totalCount || 0;
  const pageSize = recordsResponse?.data?.pageSize || 15;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{totalRecords.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-red-600">
            {records.filter(r => r.callCloseReason === 0).length.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">TE Busy</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {records.filter(r => r.callCloseReason === 1).length.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">System Busy</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-green-600">
            {records.filter(r => r.callCloseReason >= 2).length.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Others</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reason, time, or description..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleFilters}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reason Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Reason</label>
                <select
                  value={filterReason === 'all' ? 'all' : filterReason}
                  onChange={(e) => onFilterReasonChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Reasons</option>
                  <option value={0}>TE Busy</option>
                  <option value={1}>System Busy</option>
                  <option value={2}>No Answer</option>
                  <option value={3}>Not Found</option>
                  <option value={4}>Complete</option>
                  <option value={5}>Preempted</option>
                  <option value={6}>Timeout</option>
                  <option value={7}>Inactive</option>
                  <option value={8}>Callback</option>
                  <option value={9}>Unsupported Request</option>
                  <option value={10}>Invalid Call</option>
                </select>
              </div>

              {/* Hour Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hour</label>
                <select
                  value={filterHour === 'all' ? 'all' : filterHour}
                  onChange={(e) => onFilterHourChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Hours</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}.00 - {i.toString().padStart(2, '0')}.59
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Call Records Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {records.length} of {totalRecords.toLocaleString()} records
                {searchTerm && ` • Searching for "${searchTerm}"`}
                {filterReason !== 'all' && ` • Filtered by ${getCloseReasonText(filterReason as number)}`}
                {filterHour !== 'all' && ` • Hour ${filterHour}`}
              </p>
            </div>
            
            {/* Pagination Info */}
            <div className="mt-2 lg:mt-0">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('calldate')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Date</span>
                    {sortBy === 'calldate' && (
                      sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('calltime')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Time</span>
                    {sortBy === 'calltime' && (
                      sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('callclosereason')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Close Reason</span>
                    {sortBy === 'callclosereason' && (
                      sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('hourgroup')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Hour Group</span>
                    {sortBy === 'hourgroup' && (
                      sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
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
                  <tr key={`${record.callRecordId}-${index}`} className="hover:bg-gray-50 transition-colors">
                    {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {record.callDate || 'N/A'}
                    </td> */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {record.callTime}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50 rounded">
                      {record.callCloseReason}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-xs">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                          record.callCloseReason === 0 ? 'bg-red-100 text-red-800 border-red-200' :
                          record.callCloseReason === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {getCloseReasonText(record.callCloseReason)}
                        </span>
                        <div className="mt-1 text-xs text-gray-600">
                          {getCloseReasonDescription(record.callCloseReason)}
                        </div>
                      </div>
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
                        {searchTerm || filterReason !== 'all' || filterHour !== 'all' 
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalRecords)}
                </span> of{' '}
                <span className="font-medium">{totalRecords.toLocaleString()}</span> results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } rounded-md`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 font-medium">Loading summary data...</span>
        </div>
      </div>
    );
  }

  if (!dailySummary) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg font-medium mb-2">No summary data available</p>
        <p className="text-gray-500 text-sm">Select a date with data to view summary</p>
      </div>
    );
  }

   return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Call Summary</h2>
            <p className="text-gray-600 mt-1">
              Overview for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {dailySummary.totalQty.toLocaleString()} Total Calls
          </div>
        </div>
      </div>

 {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Charts Section */}
      {dailySummary.hourlyData && dailySummary.hourlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Call Distribution by Hour</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span>24-hour overview</span>
              </div>
            </div>
            <HourlyChart hourlyData={dailySummary.hourlyData} />
          </div>

          {/* Hourly Summary Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hourly Detailed Summary</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Breakdown by hour</span>
              </div>
            </div>
            <HourlySummaryTable hourlyData={dailySummary.hourlyData} />
          </div>
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
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      text: 'text-blue-700',
      valueText: 'text-blue-900',
      border: 'border-blue-100'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-500',
      text: 'text-red-700',
      valueText: 'text-red-900',
      border: 'border-red-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-500',
      text: 'text-yellow-700',
      valueText: 'text-yellow-900',
      border: 'border-yellow-100'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-500',
      text: 'text-green-700',
      valueText: 'text-green-900',
      border: 'border-green-100'
    }
  };

  const config = colorConfig[color];

  return (
    <div className={`relative rounded-2xl border ${config.border} ${config.bg} p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] group overflow-hidden`}>
      {/* Background accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${config.iconBg}`}></div>
      
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${config.iconBg} text-white shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.text} mb-1 uppercase tracking-wide`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${config.valueText} mb-2 leading-tight`}>
            {value}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallRecordsPage;