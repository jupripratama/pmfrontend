import { CallRecord } from "../types/callRecord";

export const testCallRecords: CallRecord[] = [
  {
    callRecordId: 1,
    callDate: '2024-01-15',
    callTime: '08:30:45',
    callCloseReason: 1,
    closeReasonDescription: 'TE Busy',
    hourGroup: 8,
    createdAt: '2024-01-15T08:30:45Z'
  },
  {
    callRecordId: 2,
    callDate: '2024-01-15',
    callTime: '09:15:20',
    callCloseReason: 2,
    closeReasonDescription: 'System Busy',
    hourGroup: 9,
    createdAt: '2024-01-15T09:15:20Z'
  },
  {
    callRecordId: 3,
    callDate: '2024-01-15',
    callTime: '10:45:10',
    callCloseReason: 3,
    closeReasonDescription: 'Others',
    hourGroup: 10,
    createdAt: '2024-01-15T10:45:10Z'
  },
  // Tambahkan lebih banyak data test...
];