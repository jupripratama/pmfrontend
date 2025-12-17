export interface NecRslHistoryQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  necLinkId?: number;
  sortBy?: string;
  sortDir?: string;
  filtersJson?: string;
}

export interface NecRslHistoryItemDto {
  id: number;
  necLinkId: number;
  linkName: string;
  nearEndTower: string;
  farEndTower: string;
  date: string; // ISO Date String
  rslNearEnd: number;
  rslFarEnd?: number | null;
  no: number;
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
  monthlyAvg: Record<string, number>; // key: "Jan", "Feb", etc.
  yearlyAvg: number;
  warnings: string[];
}

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

export interface NecLinkListDto {
  id: number;
  linkName: string;
  nearEndTower: string;
  farEndTower: string;
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

export interface NecRslHistoryCreateDto {
  necLinkId: number;
  date: string; // ISO Date String
  rslNearEnd: number;
  rslFarEnd?: number | null;
}

export interface NecRslHistoryUpdateDto {
  rslNearEnd: number;
  rslFarEnd?: number | null;
}
