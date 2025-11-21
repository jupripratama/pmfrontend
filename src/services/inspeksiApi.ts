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

  // ✅ TAMBAHKAN UNTUK HISTORY
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
  getAll: async (
    params?: InspeksiQueryParams
  ): Promise<PagedResponse<TemuanKPC>> => {
    // ✅ FIX: Gunakan queryParams yang sudah dibuat, bukan params langsung
    const queryParams = {
      ...params,
      includeDeleted: params?.includeDeleted ?? false,
    };

    console.log("📥 GET All params:", queryParams);

    // ✅ FIX: Kirim queryParams, bukan params
    const res = await api.get("/api/inspeksi-temuan-kpc", {
      params: queryParams, // ← INI YANG DIPERBAIKI
    });

    console.log("📥 GET All response - total items:", res.data.data?.length);

    return {
      data: res.data.data ?? [],
      page: res.data.page ?? 1,
      pageSize: res.data.pageSize ?? 15,
      totalCount: res.data.totalCount ?? 0,
      totalPages: res.data.totalPages ?? 1,
    };
  },

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

    console.log(
      "📚 GET History response - total items:",
      res.data.data?.length
    );

    return {
      data: res.data.data ?? [],
      page: res.data.page ?? 1,
      pageSize: res.data.pageSize ?? 15,
      totalCount: res.data.totalCount ?? 0,
      totalPages: res.data.totalPages ?? 1,
    };
  },

  getById: async (id: number): Promise<TemuanKPC> => {
    const res = await api.get(`/api/inspeksi-temuan-kpc/${id}`);
    return res.data.data ?? res.data;
  },

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

  update: async (
    id: number,
    data: {
      // ✅ TAMBAHKAN SEMUA FIELD
      ruang?: string;
      temuan?: string;
      kategoriTemuan?: string;
      inspector?: string;
      severity?: string;
      tanggalTemuan?: string;
      noFollowUp?: string;
      perbaikanDilakukan?: string;
      tanggalPerbaikan?: string;
      tanggalSelesaiPerbaikan?: string;
      picPelaksana?: string;
      status?: string;
      keterangan?: string;
      fotoTemuanFiles?: File[];
      fotoHasilFiles?: File[];
    }
  ): Promise<{ message: string }> => {
    const formData = new FormData();

    // ✅ APPEND SEMUA FIELD
    if (data.ruang) formData.append("ruang", data.ruang);
    if (data.temuan) formData.append("temuan", data.temuan);
    if (data.kategoriTemuan)
      formData.append("kategoriTemuan", data.kategoriTemuan);
    if (data.inspector) formData.append("inspector", data.inspector);
    if (data.severity) formData.append("severity", data.severity);
    if (data.tanggalTemuan)
      formData.append("tanggalTemuan", data.tanggalTemuan);
    if (data.noFollowUp) formData.append("noFollowUp", data.noFollowUp);
    if (data.perbaikanDilakukan)
      formData.append("perbaikanDilakukan", data.perbaikanDilakukan);
    if (data.tanggalPerbaikan)
      formData.append("tanggalPerbaikan", data.tanggalPerbaikan);
    if (data.tanggalSelesaiPerbaikan)
      formData.append("tanggalSelesaiPerbaikan", data.tanggalSelesaiPerbaikan);
    if (data.picPelaksana) formData.append("picPelaksana", data.picPelaksana);
    if (data.status) formData.append("status", data.status);
    if (data.keterangan) formData.append("keterangan", data.keterangan);

    if (data.fotoTemuanFiles && data.fotoTemuanFiles.length > 0) {
      data.fotoTemuanFiles.forEach((file) => {
        formData.append("fotoTemuanFiles", file);
      });
    }

    if (data.fotoHasilFiles && data.fotoHasilFiles.length > 0) {
      data.fotoHasilFiles.forEach((file) => {
        formData.append("fotoHasilFiles", file);
      });
    }

    const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  delete: async (id: number): Promise<DeleteResponse> => {
    console.log("🗑️ Deleting inspeksi:", id);
    const res = await api.delete(`/api/inspeksi-temuan-kpc/${id}`);
    console.log("✅ Inspeksi deleted:", res.data);

    return {
      message: res.data.message || "Temuan berhasil dihapus",
    };
  },

  restore: async (id: number): Promise<{ message: string }> => {
    console.log("♻️ Restoring inspeksi:", id);
    const res = await api.patch(`/api/inspeksi-temuan-kpc/${id}/restore`);
    console.log("✅ Inspeksi restored:", res.data);
    return res.data;
  },

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
      responseType: "blob", // ✅ FIX: responseType bukan responseType
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
