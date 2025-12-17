import {
  NecLinkCreateDto,
  NecLinkListDto,
  NecLinkUpdateDto,
  NecMonthlyHistoryResponseDto,
  NecRslHistoryCreateDto,
  NecRslHistoryItemDto,
  NecRslHistoryQueryDto,
  NecRslHistoryUpdateDto,
  NecSignalImportRequestDto,
  NecSignalImportResultDto,
  NecYearlySummaryDto,
  PagedResultDto,
  TowerCreateDto,
  TowerListDto,
  TowerUpdateDto,
} from "../types/necSignal";
import { api } from "./api";

export const necSignalApi = {
  // === HISTORY CRUD ===
  getHistories: async (
    query: NecRslHistoryQueryDto
  ): Promise<PagedResultDto<NecRslHistoryItemDto>> => {
    const response = await api.get("/api/nec-signal/histories", {
      params: query,
    });
    return response.data.data;
  },

  getHistoryById: async (id: number): Promise<NecRslHistoryItemDto> => {
    const response = await api.get(`/api/nec-signal/histories/${id}`);
    return response.data.data;
  },

  createHistory: async (
    dto: NecRslHistoryCreateDto
  ): Promise<NecRslHistoryItemDto> => {
    const response = await api.post("/api/nec-signal/histories", dto);
    return response.data.data;
  },

  updateHistory: async (
    id: number,
    dto: NecRslHistoryUpdateDto
  ): Promise<NecRslHistoryItemDto> => {
    const response = await api.put(`/api/nec-signal/histories/${id}`, dto);
    return response.data.data;
  },

  deleteHistory: async (id: number): Promise<void> => {
    await api.delete(`/api/nec-signal/histories/${id}`);
  },

  // === MONTHLY & YEARLY SUMMARY ===
  getMonthly: async (
    year: number,
    month: number
  ): Promise<NecMonthlyHistoryResponseDto> => {
    const response = await api.get("/api/nec-signal/monthly", {
      params: { year, month },
    });
    return response.data.data;
  },

  getYearly: async (year: number): Promise<NecYearlySummaryDto> => {
    const response = await api.get("/api/nec-signal/yearly", {
      params: { year },
    });
    return response.data.data;
  },

  // === IMPORT & EXPORT ===
  importExcel: async (
    request: NecSignalImportRequestDto
  ): Promise<NecSignalImportResultDto> => {
    const formData = new FormData();
    formData.append("excelFile", request.excelFile);
    const response = await api.post("/api/nec-signal/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  exportYearlyExcel: async (year: number, tower?: string): Promise<void> => {
    const response = await api.get("/api/nec-signal/export-yearly-excel", {
      params: { year, tower },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const fileName = `RSL_History_NEC_${year}${tower ? `_${tower}` : ""}.xlsx`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // === CRUD TOWER ===
  getTowers: async (): Promise<TowerListDto[]> => {
    const response = await api.get("/api/nec-signal/towers");
    return response.data.data;
  },

  createTower: async (dto: TowerCreateDto): Promise<TowerListDto> => {
    const response = await api.post("/api/nec-signal/towers", dto);
    return response.data.data;
  },

  updateTower: async (dto: TowerUpdateDto): Promise<TowerListDto> => {
    const response = await api.put("/api/nec-signal/towers", dto);
    return response.data.data;
  },

  deleteTower: async (id: number): Promise<void> => {
    await api.delete(`/api/nec-signal/towers/${id}`);
  },

  // === CRUD LINK ===
  getLinks: async (): Promise<NecLinkListDto[]> => {
    const response = await api.get("/api/nec-signal/links");
    return response.data.data;
  },

  createLink: async (dto: NecLinkCreateDto): Promise<NecLinkListDto> => {
    const response = await api.post("/api/nec-signal/links", dto);
    return response.data.data;
  },

  updateLink: async (dto: NecLinkUpdateDto): Promise<NecLinkListDto> => {
    const response = await api.put("/api/nec-signal/links", dto);
    return response.data.data;
  },

  deleteLink: async (id: number): Promise<void> => {
    await api.delete(`/api/nec-signal/links/${id}`);
  },
};
