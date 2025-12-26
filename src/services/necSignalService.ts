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
  NecYearlyPivotDto,
  PagedResultDto,
  TowerCreateDto,
  TowerListDto,
  TowerUpdateDto,
} from "../types/necSignal";
import { api } from "./api";

export const necSignalApi = {
  // ============================================
  // HISTORY CRUD
  // ============================================

  getHistories: async (
    query: NecRslHistoryQueryDto
  ): Promise<PagedResultDto<NecRslHistoryItemDto>> => {
    try {
      console.log("📡 Sending query to API:", query);

      const response = await api.get("/api/nec-signal/histories", {
        params: query,
      });

      console.log("📊 Raw API Response:", response.data);

      // ✅ PERBAIKAN: Handle struktur dengan meta.pagination
      let result: PagedResultDto<NecRslHistoryItemDto>;

      if (response.data.meta && response.data.meta.pagination) {
        // Struktur dengan nested meta
        const pagination = response.data.meta.pagination;
        result = {
          data: response.data.data || [],
          page: pagination.page || 1,
          pageSize: pagination.pageSize || 15,
          totalCount: pagination.totalCount || 0,
          totalPages: pagination.totalPages || 1,
          hasNext: pagination.hasNext || false,
          hasPrevious: pagination.hasPrevious || false,
        };
      } else {
        // Fallback: struktur flat (untuk backward compatibility)
        result = {
          data: response.data.data || [],
          page: response.data.page || 1,
          pageSize: response.data.pageSize || 15,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false,
        };
      }

      console.log("✅ Processed result:", {
        dataCount: result.data.length,
        page: result.page,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      });

      return result;
    } catch (error) {
      console.error("❌ Error in getHistories API:", error);
      throw error;
    }
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

  // ============================================
  // MONTHLY & YEARLY SUMMARY
  // ============================================

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

  // ============================================
  // ✅ NEW: YEARLY PIVOT
  // ============================================

  getYearlyPivot: async (
    year: number,
    tower?: string
  ): Promise<NecYearlyPivotDto[]> => {
    const response = await api.get("/api/nec-signal/yearly-pivot", {
      params: { year, tower },
    });
    return response.data.data;
  },

  // ============================================
  // IMPORT & EXPORT
  // ============================================

  importPivotExcel: async (
    request: NecSignalImportRequestDto
  ): Promise<NecSignalImportResultDto> => {
    console.log("🔄 Starting importPivotExcel...");

    const formData = new FormData();
    formData.append("excelFile", request.excelFile);

    console.log("📤 FormData entries:");
    for (const pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }

    try {
      console.log("📡 Sending to:", "/api/nec-signal/import-pivot-excel");

      const response = await api.post(
        "/api/nec-signal/import-pivot-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Response received:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ API Error details:");
      console.error("  Status:", error.response?.status);
      console.error("  Status Text:", error.response?.statusText);
      console.error("  Headers:", error.response?.headers);
      console.error("  Data:", error.response?.data);
      console.error("  Config:", error.config);
      throw error;
    }
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

  // ============================================
  // CRUD TOWER
  // ============================================

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

  // ============================================
  // CRUD LINK
  // ============================================

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
