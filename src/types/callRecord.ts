export interface CallRecord {
  callRecordId: number;
  callDate: string;
  callTime: string;
  callCloseReason: number;
  closeReasonDescription: string;
  hourGroup: number;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  hourlyData: HourlySummary[];
  totalQty: number;
  totalTEBusy: number;
  totalSysBusy: number;
  totalOthers: number;
  avgTEBusyPercent: number;
  avgSysBusyPercent: number;
  avgOthersPercent: number;
}

export interface HourlySummary {
  date: string;
  hourGroup: number;
  timeRange: string;
  qty: number;
  teBusy: number;
  teBusyPercent: number;
  sysBusy: number;
  sysBusyPercent: number;
  others: number;
  othersPercent: number;
}

export interface UploadCsvResponse {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
  uploadTime: string;
}

// Tambahkan interface untuk API response jika perlu
export interface CallRecordsResponse {
  statusCode: number;
  message: string;
  data: {
    data: CallRecord[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  meta: any;
}

export enum FleetStatisticType {
  All = 'All',
  Caller = 'Caller',
  Called = 'Called'
}

export interface TopCallerFleetDto {
  rank: number;
  callerFleet: string;
  totalCalls: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  averageDurationSeconds: number;
  averageDurationFormatted: string;
}

export interface TopCalledFleetDto {
  rank: number;
  calledFleet: string;
  totalCalls: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  averageDurationSeconds: number;
  averageDurationFormatted: string;
  uniqueCallers: number;
}

export interface FleetStatisticsDto {
  date: string;
  topCallers: TopCallerFleetDto[];
  topCalledFleets: TopCalledFleetDto[];
  totalCallsInDay: number;
  totalDurationInDaySeconds: number;
  totalDurationInDayFormatted: string;
  totalUniqueCallers: number;
  totalUniqueCalledFleets: number;
}