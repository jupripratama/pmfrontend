// services/inspeksiService.ts - FIXED FOR CAMELCASE BACKEND
import { api } from "./api";

export interface TemuanKPC {
  id?: number;
  ruang: string;
  temuan: string;
  kategoriTemuan?: string;
  inspector?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  tanggalTemuan: string;
  noFollowUp?: string;
  followUpRef?: string;
  perbaikanDilakukan?: string;
  tanggalPerbaikan?: string;
  tanggalSelesaiPerbaikan?: string;
  picPelaksana?: string;
  status: "Open" | "In Progress" | "Closed" | "Rejected";
  keterangan?: string;

  fotoTemuanUrls?: string[];
  fotoHasilUrls?: string[];

  fotoTemuan?: string;
  fotoHasil?: string;

  createdByName?: string;
  createdAt?: string;
  updatedByName?: string;
  updatedAt?: string;

  isDeleted?: boolean;
}

export interface InspeksiQueryParams {
  page?: number;
  pageSize?: number;
  ruang?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface DeleteResponse {
  message: string;
}

// ✅ FIXED: Backend now returns camelCase: { data: [], meta: { pagination } }
const extractPagination = (dataArray: any[], meta: any) => {
  console.log("🔍 extractPagination - data length:", dataArray?.length ?? 0);
  console.log("🔍 extractPagination - meta:", meta);

  // ✅ FIXED: Use camelCase 'pagination' not 'Pagination'
  const pagination = meta?.pagination || {};

  return {
    data: dataArray || [],
    page: pagination.page || 1,
    pageSize: pagination.pageSize || 15,
    totalCount: pagination.totalCount || 0,
    totalPages: pagination.totalPages || 1,
    hasNext: pagination.hasNext || false,
    hasPrevious: pagination.hasPrevious || false,
  };
};

export const inspeksiApi = {
  // ✅ GET ALL - FIXED FOR CAMELCASE
  getAll: async (
    params?: InspeksiQueryParams
  ): Promise<{
    data: TemuanKPC[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> => {
    const queryParams = {
      ...params,
      includeDeleted: params?.includeDeleted ?? false,
    };

    console.log("📥 GET All params:", queryParams);

    const res = await api.get("/api/inspeksi-temuan-kpc", {
      params: queryParams,
    });

    console.log("📥 GET All RAW response:", res.data);

    // ✅ Backend returns: { statusCode, message, data: [], meta: { pagination } }
    const extracted = extractPagination(res.data.data, res.data.meta);

    console.log("📥 GET All parsed:", {
      totalCount: extracted.totalCount,
      totalPages: extracted.totalPages,
      page: extracted.page,
      dataLength: extracted.data.length,
    });

    return extracted;
  },

  // ✅ GET HISTORY - FIXED FOR CAMELCASE
  getHistory: async (
    params?: InspeksiQueryParams
  ): Promise<{
    data: TemuanKPC[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> => {
    const queryParams = {
      ...params,
      includeDeleted: true,
    };

    console.log("📚 GET History params:", queryParams);

    const res = await api.get("/api/inspeksi-temuan-kpc/history", {
      params: queryParams,
    });

    console.log("📚 GET History RAW response:", res.data);

    // ✅ Backend returns: { statusCode, message, data: [], meta: { pagination } }
    const extracted = extractPagination(res.data.data, res.data.meta);

    console.log("📚 GET History parsed:", {
      totalCount: extracted.totalCount,
      totalPages: extracted.totalPages,
      page: extracted.page,
      dataLength: extracted.data.length,
    });

    return extracted;
  },

  // ✅ GET BY ID - FIXED
  getById: async (id: number): Promise<TemuanKPC> => {
    console.log("🔍 GET By ID:", id);
    const res = await api.get(`/api/inspeksi-temuan-kpc/${id}`);
    console.log("🔍 GET By ID response:", res.data);

    // ✅ Backend returns: { statusCode, message, data: TemuanKPC, meta }
    return res.data.data;
  },

  // ✅ CREATE
  create: async (
    formData: FormData
  ): Promise<{ message: string; id: number }> => {
    console.log("📤 CREATE - Sending FormData");
    console.log("📁 FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: ${value.name} (${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const res = await api.post("/api/inspeksi-temuan-kpc", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ CREATE SUCCESS - Response:", res.data);

    // ✅ Backend returns: { statusCode, message, data: { id }, meta }
    return {
      message: res.data.message || "Temuan berhasil dibuat",
      id: res.data.data.id,
    };
  },

  // ✅ UPDATE
  update: async (
    id: number,
    formData: FormData
  ): Promise<{ message: string; data?: TemuanKPC }> => {
    console.log("📤 UPDATE - Sending FormData for ID:", id);
    console.log("📁 FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: ${value.name} (${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    try {
      const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ UPDATE SUCCESS - Response:", res.data);

      // ✅ Backend returns: { statusCode, message, data: TemuanKPC, meta }
      return {
        message: res.data.message || "Update berhasil",
        data: res.data.data,
      };
    } catch (error: any) {
      console.error("❌ UPDATE FAILED:", error);
      throw error;
    }
  },

  // ✅ DELETE (SOFT DELETE)
  delete: async (id: number): Promise<DeleteResponse> => {
    console.log("🗑️ Deleting inspeksi:", id);
    const res = await api.delete(`/api/inspeksi-temuan-kpc/${id}`);
    console.log("✅ Inspeksi deleted:", res.data);

    return {
      message: res.data.message || "Temuan berhasil dihapus",
    };
  },

  // ✅ DELETE PERMANENT
  deletePermanent: async (id: number): Promise<DeleteResponse> => {
    console.log("🔥 Permanently deleting inspeksi:", id);
    const res = await api.delete(`/api/inspeksi-temuan-kpc/${id}/permanent`);
    console.log("✅ Inspeksi permanently deleted:", res.data);

    return {
      message: res.data.message || "Temuan berhasil dihapus permanen",
    };
  },

  // ✅ DELETE FOTO TEMUAN
  deleteFotoTemuan: async (
    id: number,
    index: number
  ): Promise<{ message: string }> => {
    console.log(`🗑️ Deleting foto temuan for ID: ${id}, index: ${index}`);
    const res = await api.delete(
      `/api/inspeksi-temuan-kpc/${id}/foto-temuan/${index}`
    );
    console.log("✅ Foto temuan deleted:", res.data);

    return {
      message: res.data.message || "Foto temuan berhasil dihapus",
    };
  },

  // ✅ DELETE FOTO HASIL
  deleteFotoHasil: async (
    id: number,
    index: number
  ): Promise<{ message: string }> => {
    console.log(`🗑️ Deleting foto hasil for ID: ${id}, index: ${index}`);
    const res = await api.delete(
      `/api/inspeksi-temuan-kpc/${id}/foto-hasil/${index}`
    );
    console.log("✅ Foto hasil deleted:", res.data);

    return {
      message: res.data.message || "Foto hasil berhasil dihapus",
    };
  },

  // ✅ RESTORE
  restore: async (id: number): Promise<{ message: string }> => {
    console.log("♻️ Restoring inspeksi:", id);
    const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}/restore`);
    console.log("✅ Inspeksi restored:", res.data);

    return {
      message: res.data.message || "Temuan berhasil dipulihkan",
    };
  },

  // ✅ EXPORT TO EXCEL
  exportToExcel: async (params?: {
    history?: boolean;
    startDate?: string;
    endDate?: string;
    ruang?: string;
    status?: string;
  }): Promise<void> => {
    console.log("📥 Exporting to Excel:", params);

    const response = await api.get("/api/inspeksi-temuan-kpc/export", {
      params,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const fileName = params?.history
      ? `History_KPC_${new Date().toISOString().split("T")[0]}.xlsx`
      : `Laporan_KPC_${new Date().toISOString().split("T")[0]}.xlsx`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log("✅ Excel exported successfully");
  },
};
