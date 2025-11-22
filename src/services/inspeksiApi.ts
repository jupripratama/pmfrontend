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

export interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DeleteResponse {
  message: string;
}

export const inspeksiApi = {
  // ✅ GET ALL - FIXED totalCount handling
  getAll: async (
    params?: InspeksiQueryParams
  ): Promise<PagedResponse<TemuanKPC>> => {
    const queryParams = {
      ...params,
      includeDeleted: params?.includeDeleted ?? false,
    };

    console.log("📥 GET All params:", queryParams);

    const res = await api.get("/api/inspeksi-temuan-kpc", {
      params: queryParams,
    });

    console.log("📥 GET All RAW response:", res.data);

    // ✅ FIXED: Use proper null checking instead of falsy checking
    // Problem: 0 is falsy, so it would fallback to data.length even when totalCount is legitimately 0
    const totalCount =
      res.data.totalCount !== undefined && res.data.totalCount !== null
        ? res.data.totalCount
        : res.data.data?.length ?? 0;

    const totalPages =
      res.data.totalPages !== undefined && res.data.totalPages !== null
        ? res.data.totalPages
        : Math.ceil(totalCount / (params?.pageSize ?? 15));

    console.log(
      "📥 GET All parsed - totalCount:",
      totalCount,
      "totalPages:",
      totalPages,
      "dataLength:",
      res.data.data?.length
    );

    return {
      data: res.data.data || [],
      page: res.data.page || 1,
      pageSize: res.data.pageSize || 15,
      totalCount: totalCount,
      totalPages: totalPages,
    };
  },

  // ✅ GET HISTORY - FIXED totalCount handling
  getHistory: async (
    params?: InspeksiQueryParams
  ): Promise<PagedResponse<TemuanKPC>> => {
    const queryParams = {
      ...params,
      includeDeleted: true,
    };

    console.log("📚 GET History params:", queryParams);

    const res = await api.get("/api/inspeksi-temuan-kpc/history", {
      params: queryParams,
    });

    console.log("📚 GET History RAW response:", res.data);
    console.log(
      "📚 GET History response - total items:",
      res.data.data?.length,
      "totalCount:",
      res.data.totalCount
    );

    // ✅ FIXED: Same fix as getAll
    const totalCount =
      res.data.totalCount !== undefined && res.data.totalCount !== null
        ? res.data.totalCount
        : res.data.data?.length ?? 0;

    const totalPages =
      res.data.totalPages !== undefined && res.data.totalPages !== null
        ? res.data.totalPages
        : Math.ceil(totalCount / (params?.pageSize ?? 15));

    return {
      data: res.data.data || [],
      page: res.data.page || 1,
      pageSize: res.data.pageSize || 15,
      totalCount: totalCount,
      totalPages: totalPages,
    };
  },

  // ✅ GET BY ID
  getById: async (id: number): Promise<TemuanKPC> => {
    console.log("🔍 GET By ID:", id);
    const res = await api.get(`/api/inspeksi-temuan-kpc/${id}`);
    console.log("🔍 GET By ID response:", res.data);

    // Backend might return { data: {...} } or just {...}
    return res.data.data ?? res.data;
  },

  // ✅ CREATE
  create: async (data: {
    ruang: string;
    temuan: string;
    kategoriTemuan?: string;
    inspector?: string;
    severity?: string;
    tanggalTemuan?: string;
    noFollowUp?: string;
    picPelaksana?: string;
    keterangan?: string;
    fotoTemuanFiles?: File[];
  }): Promise<{ message: string; id: number }> => {
    console.log("📤 Creating new inspeksi:", data);

    const formData = new FormData();
    formData.append("ruang", data.ruang);
    formData.append("temuan", data.temuan);

    if (data.kategoriTemuan)
      formData.append("kategoriTemuan", data.kategoriTemuan);
    if (data.inspector) formData.append("inspector", data.inspector);
    if (data.severity) formData.append("severity", data.severity);
    if (data.tanggalTemuan)
      formData.append("tanggalTemuan", data.tanggalTemuan);
    if (data.noFollowUp) formData.append("noFollowUp", data.noFollowUp);
    if (data.picPelaksana) formData.append("picPelaksana", data.picPelaksana);
    if (data.keterangan) formData.append("keterangan", data.keterangan);

    if (data.fotoTemuanFiles && data.fotoTemuanFiles.length > 0) {
      data.fotoTemuanFiles.forEach((file) => {
        formData.append("fotoTemuanFiles", file);
      });
    }

    console.log("📤 FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        value instanceof File ? `${value.name} (${value.size} bytes)` : value
      );
    }

    const res = await api.post("/api/inspeksi-temuan-kpc", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Inspeksi created:", res.data);
    return res.data;
  },

  // ✅ UPDATE
  update: async (
    id: number,
    data: any
  ): Promise<{ message: string; data?: TemuanKPC }> => {
    console.log("📤 UPDATE - Raw data to send:", data);
    console.log(
      "📁 Files - FotoHasil:",
      data.fotoHasilFiles?.length || 0,
      "FotoTemuan:",
      data.fotoTemuanFiles?.length || 0
    );

    const formData = new FormData();

    // ✅ TAMBAHKAN SEMUA FIELD YANG BISA DIUPDATE
    const fields = [
      "ruang",
      "temuan",
      "kategoriTemuan",
      "inspector",
      "severity",
      "tanggalTemuan",
      "noFollowUp",
      "perbaikanDilakukan",
      "tanggalPerbaikan",
      "tanggalSelesaiPerbaikan",
      "picPelaksana",
      "status",
      "keterangan",
    ];

    fields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        formData.append(field, data[field]);
        console.log(`  📝 Appending ${field}:`, data[field]);
      }
    });

    // ✅ TAMBAHKAN CLEAR FLAGS JIKA ADA
    if (data.clearNoFollowUp) {
      formData.append("clearNoFollowUp", "true");
      console.log(`  🗑️ Setting clearNoFollowUp flag`);
    }
    if (data.clearPicPelaksana) {
      formData.append("clearPicPelaksana", "true");
      console.log(`  🗑️ Setting clearPicPelaksana flag`);
    }
    if (data.clearPerbaikanDilakukan) {
      formData.append("clearPerbaikanDilakukan", "true");
      console.log(`  🗑️ Setting clearPerbaikanDilakukan flag`);
    }
    if (data.clearKeterangan) {
      formData.append("clearKeterangan", "true");
      console.log(`  🗑️ Setting clearKeterangan flag`);
    }

    // ✅ HANDLE FILE UPLOADS - PASTIKAN FILE TERKIRIM
    if (data.fotoTemuanFiles && Array.isArray(data.fotoTemuanFiles)) {
      data.fotoTemuanFiles.forEach((file: File, index: number) => {
        formData.append("fotoTemuanFiles", file);
        console.log(
          `  📁 Appending fotoTemuanFiles[${index}]:`,
          file.name,
          `(${file.size} bytes, ${file.type})`
        );
      });
    }

    if (data.fotoHasilFiles && Array.isArray(data.fotoHasilFiles)) {
      data.fotoHasilFiles.forEach((file: File, index: number) => {
        formData.append("fotoHasilFiles", file);
        console.log(
          `  📁 Appending fotoHasilFiles[${index}]:`,
          file.name,
          `(${file.size} bytes, ${file.type})`
        );
      });
    }

    // Log FormData contents
    console.log("📤 FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}:`,
          `${value.name} (${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    try {
      const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ UPDATE SUCCESS - Response:", res.data);
      return {
        message: res.data.message || "Update berhasil",
        data: res.data.data || res.data,
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
    return res.data;
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
    return res.data;
  },

  // ✅ RESTORE
  restore: async (id: number): Promise<{ message: string }> => {
    console.log("♻️ Restoring inspeksi:", id);
    const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}/restore`);
    console.log("✅ Inspeksi restored:", res.data);
    return res.data;
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
