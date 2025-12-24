// ============================================
// BASE QUERY & PAGINATION
// ============================================

export interface NecRslHistoryQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  necLinkId?: number;
  sortBy?: string;
  sortDir?: string;
  filtersJson?: string;
}

export interface PagedResultDto<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// HISTORY ITEMS - ✅ UPDATED with Notes & Status
// ============================================

export interface NecRslHistoryItemDto {
  id: number;
  necLinkId: number;
  linkName: string;
  nearEndTower: string;
  farEndTower: string;
  date: string;
  rslNearEnd?: number | null;
  rslFarEnd?: number | null;
  notes?: string | null; // ✅ NEW
  status?: number | string | null | undefined; // ✅ NEW: "active", "dismantled", "removed", "obstacle"
  no: number;
}

export interface NecRslHistoryCreateDto {
  necLinkId: number;
  date: string;
  rslNearEnd?: number | null;
  rslFarEnd?: number | null;
  notes?: string | null; // ✅ NEW
  status?: string | null; // ✅ NEW
}

export interface NecRslHistoryUpdateDto {
  rslNearEnd: number | null;
  rslFarEnd?: number | null;
  notes?: string | null; // ✅ NEW
  status?: string | null; // ✅ NEW
}

// ============================================
// MONTHLY & YEARLY SUMMARY
// ============================================

export interface NecMonthlyHistoryResponseDto {
  period: string;
  data: NecTowerMonthlyDto[];
}

export interface NecTowerMonthlyDto {
  towerName: string;
  links: NecLinkMonthlyDto[];
}

export interface NecLinkMonthlyDto {
  linkName: string;
  avgRsl: number;
  status: string;
  warningMessage?: string | null;
}

export interface NecYearlySummaryDto {
  year: number;
  towers: NecTowerYearlyDto[];
}

export interface NecTowerYearlyDto {
  towerName: string;
  links: Record<string, NecLinkYearlyDto>;
}

export interface NecLinkYearlyDto {
  monthlyAvg: Record<string, number>;
  yearlyAvg: number;
  warnings: string[];
}

// ============================================
// PIVOT TABLE
// ============================================

export interface NecYearlyPivotDto {
  linkName: string;
  tower: string;
  monthlyValues: Record<string, number | null>;
  monthlyStatuses: Record<string, string>;
  expectedRslMin: number;
  expectedRslMax: number;
  notes?: Record<string, string>; // ✅ NEW: Notes per month
}

export interface NecChartData {
  month: string;
  monthIndex?: number;
  [key: string]: string | number | null | undefined;
}

export interface NecTowerStats {
  towerName: string;
  totalLinks: number;
  avgRsl: number;
  healthyLinks: number;
  warningLinks: number;
  criticalLinks: number;
}

// ============================================
// IMPORT & EXPORT
// ============================================

export interface NecSignalImportRequestDto {
  excelFile: File;
}

export interface NecSignalImportResultDto {
  totalRowsProcessed: number;
  successfulInserts: number;
  failedRows: number;
  errors: string[];
  message: string;
}

// ============================================
// TOWER
// ============================================

export interface TowerListDto {
  id: number;
  name: string;
  location?: string | null;
  linkCount: number;
}

export interface TowerCreateDto {
  name: string;
  location?: string | null;
}

export interface TowerUpdateDto extends TowerCreateDto {
  id: number;
}

// ============================================
// LINK
// ============================================

export interface NecLinkListDto {
  id: number;
  linkName: string;
  nearEndTower: string;
  farEndTower: string;
  nearEndTowerId: number;
  farEndTowerId: number;
  expectedRslMin: number;
  expectedRslMax: number;
}

export interface NecLinkCreateDto {
  linkName: string;
  nearEndTowerId: number;
  farEndTowerId: number;
  expectedRslMin?: number;
  expectedRslMax?: number;
}

export interface NecLinkUpdateDto extends NecLinkCreateDto {
  id: number;
}
