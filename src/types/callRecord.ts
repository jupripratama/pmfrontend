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
  data: {
    items: CallRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  statusCode: number;
  message: string;
  meta: any;
}