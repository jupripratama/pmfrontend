import React, { useState, useEffect, useRef } from "react";
import NecRslPivotTable from "./NecRslPivotTable";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  Plus,
  Edit,
  Trash,
  Download,
  Upload,
  BarChart2,
  TrendingUp,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { necSignalApi } from "../../services/necSignalService";
import {
  NecRslHistoryItemDto,
  NecMonthlyHistoryResponseDto,
  NecYearlySummaryDto,
  NecSignalImportResultDto,
} from "../../types/necSignal";

interface HistoryDataPoint {
  date: string;
  value: number;
}

const RSL_THRESHOLDS = {
  TOO_STRONG_MAX: -30,
  TOO_STRONG_MIN: -45,
  OPTIMAL_MAX: -45,
  OPTIMAL_MIN: -55,
  WARNING_MAX: -55,
  WARNING_MIN: -60,
  SUB_OPTIMAL_MAX: -60,
  SUB_OPTIMAL_MIN: -65,
  CRITICAL: -65,
};

// ✅ Logika RSL status (hanya untuk warningMessage)
const getRslStatus = (value: number | null): string => {
  if (value === null) return "no_data";
  if (value > RSL_THRESHOLDS.OPTIMAL_MAX) return "too_strong";
  if (value > RSL_THRESHOLDS.OPTIMAL_MIN && value <= RSL_THRESHOLDS.OPTIMAL_MAX)
    return "optimal";
  if (value > RSL_THRESHOLDS.WARNING_MIN && value <= RSL_THRESHOLDS.WARNING_MAX)
    return "warning";
  if (
    value > RSL_THRESHOLDS.SUB_OPTIMAL_MIN &&
    value <= RSL_THRESHOLDS.SUB_OPTIMAL_MAX
  )
    return "sub_optimal";
  return "critical";
};

const getRslColor = (value: number | null): string => {
  const status = getRslStatus(value);
  const colors = {
    too_strong: "bg-red-200",
    optimal: "bg-green-200",
    warning: "bg-yellow-200",
    sub_optimal: "bg-orange-200",
    critical: "bg-red-300",
    no_data: "bg-gray-100",
  };
  return colors[status as keyof typeof colors] || colors.no_data;
};

const getAvailableYears = (histories: NecRslHistoryItemDto[]) => {
  if (histories.length === 0) return [new Date().getFullYear()];
  const years = [
    ...new Set(
      histories.map((h: NecRslHistoryItemDto) => new Date(h.date).getFullYear())
    ),
  ].sort((a: number, b: number) => b - a);
  return years;
};

const getRslTextColor = (value: number | null): string => {
  const status = getRslStatus(value);
  const colors = {
    too_strong: "text-red-800",
    optimal: "text-green-800",
    warning: "text-yellow-800",
    sub_optimal: "text-orange-800",
    critical: "text-red-900",
    no_data: "text-gray-400",
  };
  return colors[status as keyof typeof colors] || colors.no_data;
};

const getRslStatusLabel = (value: number | null): string => {
  const status = getRslStatus(value);
  const labels = {
    too_strong: "Terlalu Kuat",
    optimal: "Optimal",
    warning: "Warning",
    sub_optimal: "Sub-optimal",
    critical: "Critical",
    no_data: "No Data",
  };
  return labels[status as keyof typeof labels] || labels.no_data;
};

// ✅ Mapping status operasional ke teks & warna
const getOperationalStatusDisplay = (
  status: number | string | null | undefined
) => {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "bg-green-100 text-green-800" },
    0: { label: "Active", color: "bg-green-100 text-green-800" }, // ✅ Enum value
    dismantled: { label: "Dismantled", color: "bg-red-100 text-red-800" },
    1: { label: "Dismantled", color: "bg-red-100 text-red-800" }, // ✅ Enum value
    removed: { label: "Removed", color: "bg-gray-100 text-gray-800" },
    2: { label: "Removed", color: "bg-gray-100 text-gray-800" }, // ✅ Enum value
    obstacle: { label: "Obstacle", color: "bg-yellow-100 text-yellow-800" },
    3: { label: "Obstacle", color: "bg-yellow-100 text-yellow-800" }, // ✅ Enum value
  };

  // ✅ Convert to string key
  let key: string;

  if (status === null || status === undefined) {
    key = "active";
  } else if (typeof status === "number") {
    key = status.toString(); // ✅ Convert number to string
  } else if (typeof status === "string") {
    key = status.toLowerCase().trim();
  } else {
    key = "active";
  }

  const item = map[key] || {
    label: "Unknown",
    color: "bg-blue-100 text-blue-800",
  };

  return {
    label: item.label,
    className: `px-2 py-1 rounded-full text-xs font-medium ${item.color}`,
  };
};

const NecHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [histories, setHistories] = useState<NecRslHistoryItemDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLink, setSelectedLink] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentHistory, setCurrentHistory] =
    useState<NecRslHistoryItemDto | null>(null);
  const [formData, setFormData] = useState({
    necLinkId: 0,
    date: "",
    rslNearEnd: 0,
    rslFarEnd: 0,
    notes: "",
    status: "active",
  });

  const [importFormat, setImportFormat] = useState<"row" | "pivot">("pivot");
  const [importResult, setImportResult] =
    useState<NecSignalImportResultDto | null>(null);
  // State for Monthly & Yearly Charts
  const [monthlyData, setMonthlyData] =
    useState<NecMonthlyHistoryResponseDto | null>(null);
  const [yearlyData, setYearlyData] = useState<NecYearlySummaryDto | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  // State for Import/Export
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  // State for CRUD Tower & Link
  const [towers, setTowers] = useState<{ id: number; name: string }[]>([]);
  const [links, setLinks] = useState<
    { id: number; name: string; nearEndTower: string; farEndTower: string }[]
  >([]);
  // Refs for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fetch initial data
  useEffect(() => {
    fetchHistories();
    fetchTowersAndLinks();
  }, []);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchHistories(), fetchTowersAndLinks()]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data awal. Silakan refresh halaman.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);
  // Fetch histories based on search and pagination
  const fetchHistories = async (page = 1, search = "", linkId?: number) => {
    setIsLoading(true);
    try {
      const query = {
        page,
        pageSize: 15,
        search,
        necLinkId: linkId || undefined,
      };
      console.log("📡 Fetching histories with query:", query);
      const result = await necSignalApi.getHistories(query);
      if (result && result.data && result.data.length > 0) {
        console.log("📊 First history item:", result.data[0]);
        console.log("📊 Status field:", result.data[0].status);
      }

      console.log("📊 API Response:", result);
      if (result && result.data) {
        setHistories(result.data);
        setTotalPages(result.totalPages || 1);
        setCurrentPage(result.page || 1);
      } else {
        console.warn("⚠️ No data in response");
        setHistories([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("❌ Error fetching histories:", error);
      // Tampilkan error detail
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data history.",
        variant: "destructive",
      });
      setHistories([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log("🔍 Current histories state:", histories);
    console.log("📊 Histories count:", histories.length);
  }, [histories]);
  // Fetch towers and links for dropdowns
  const fetchTowersAndLinks = async () => {
    try {
      const towersResult = await necSignalApi.getTowers();
      const linksResult = await necSignalApi.getLinks();
      setTowers(towersResult?.map((t) => ({ id: t.id, name: t.name })) || []); // ✅ FIX: Safe mapping
      setLinks(
        linksResult?.map((l) => ({
          id: l.id,
          name: l.linkName,
          nearEndTower: l.nearEndTower,
          farEndTower: l.farEndTower,
        })) || [] // ✅ FIX: Safe mapping
      );
    } catch (error) {
      console.error("Error fetching towers/links:", error);
      setTowers([]); // ✅ FIX: Set empty arrays on error
      setLinks([]);
    }
  };
  const fetchMonthlyData = async () => {
    if (!selectedYear || !selectedMonth) return;
    try {
      const result = await necSignalApi.getMonthly(selectedYear, selectedMonth);
      setMonthlyData(result);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      setMonthlyData(null); // ✅ FIX: Reset on error
    }
  };
  // Fetch yearly data for chart
  const fetchYearlyData = async () => {
    if (!selectedYear) return;
    try {
      const result = await necSignalApi.getYearly(selectedYear);
      setYearlyData(result);
    } catch (error) {
      console.error("Error fetching yearly data:", error);
      setYearlyData(null); // ✅ FIX: Reset on error
    }
  };
  useEffect(() => {
    if (activeTab === "monthly") {
      fetchMonthlyData();
    } else if (activeTab === "yearly") {
      fetchYearlyData();
    }
  }, [activeTab, selectedYear, selectedMonth]);
  // Handle form changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "necLinkId" || name === "rslNearEnd" || name === "rslFarEnd"
          ? parseFloat(value)
          : value,
    }));
  };
  // Open modal for create/edit
  const openModal = (
    mode: "create" | "edit",
    history?: NecRslHistoryItemDto
  ) => {
    setModalMode(mode);
    if (mode === "edit" && history) {
      setCurrentHistory(history);

      // ✅ PERBAIKAN: Lebih robust conversion
      let statusString = "active";
      if (history.status !== null && history.status !== undefined) {
        if (typeof history.status === "number") {
          // Enum to string mapping
          const statusMap: Record<number, string> = {
            0: "active",
            1: "dismantled",
            2: "removed",
            3: "obstacle",
          };
          statusString = statusMap[history.status] || "active";
        } else if (typeof history.status === "string") {
          statusString = history.status.toLowerCase().trim();
        }
      }
      setFormData({
        necLinkId: history.necLinkId,
        date: format(new Date(history.date), "yyyy-MM-dd"),
        rslNearEnd: history.rslNearEnd,
        rslFarEnd: history.rslFarEnd || 0,
        notes: history.notes || "",
        status: statusString, // ✅ This is now guaranteed to be string
      });
    } else {
      setCurrentHistory(null);
      setFormData({
        necLinkId: 0,
        date: "",
        rslNearEnd: 0,
        rslFarEnd: 0,
        notes: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // ✅ LOGIKA BARU: Validasi gabungan RSL dan Notes
    const hasRsl = formData.rslNearEnd !== 0; // atau null check
    const hasNotes = formData.notes?.trim().length > 0;
  
    if (!hasRsl && !hasNotes) {
      toast({
        title: "Error",
        description: "Harap isi RSL atau Catatan.",
        variant: "destructive",
      });
      return;
    }
  
    const payload = {
      necLinkId: formData.necLinkId,
      date: formData.date,
      rslNearEnd: hasRsl ? formData.rslNearEnd : null, // ✅ Boleh null
      rslFarEnd: hasRsl ? formData.rslFarEnd : null,
      notes: formData.notes,
      status: formData.status,
    };

    try {
      if (modalMode === "create") {
        await necSignalApi.createHistory(payload);
        toast({
          title: "Berhasil",
          description: "Data history berhasil ditambahkan.",
        });
      } else {
        if (currentHistory) {
          await necSignalApi.updateHistory(currentHistory.id, payload);
          toast({
            title: "Berhasil",
            description: "Data history berhasil diperbarui.",
          });
        }
      }
      setIsModalOpen(false);
      fetchHistories(currentPage, searchTerm, selectedLink ?? undefined);
    } catch (error) {
      console.error("Error saving history:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data history.",
        variant: "destructive",
      });
    }
  };

  // Delete history
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await necSignalApi.deleteHistory(id);
        toast({
          title: "Berhasil",
          description: "Data history berhasil dihapus.",
        });
        fetchHistories(currentPage, searchTerm, selectedLink ?? undefined);
      } catch (error) {
        console.error("Error deleting history:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus data history.",
          variant: "destructive",
        });
      }
    }
  };
  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Silakan pilih file Excel terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    try {
      // ✅ Hanya gunakan pivot untuk sementara
      const result = await necSignalApi.importPivotExcel({
        excelFile: importFile,
      });
      setImportResult(result);
      toast({
        title: "Impor Selesai",
        description: result.message,
      });
      setIsImportModalOpen(false);
      setImportFile(null);
      fetchHistories();
    } catch (error: any) {
      console.error("Error importing file:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Gagal mengimpor file Excel.";
      toast({
        title: "Error Import",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };
  // Handle export
  const handleExport = async () => {
    try {
      await necSignalApi.exportYearlyExcel(selectedYear);
      toast({
        title: "Ekspor Berhasil",
        description: `Laporan tahun ${selectedYear} berhasil diunduh.`,
      });
    } catch (error) {
      console.error("Error exporting file:", error);
      toast({
        title: "Error",
        description: "Gagal mengekspor laporan.",
        variant: "destructive",
      });
    }
  };
  // Generate data for charts
  const generateLineChartData = () => {
    if (!monthlyData || !monthlyData.data) return [];
    const chartData: { date: string; value: number }[] = [];
    monthlyData.data.forEach((tower) => {
      if (tower.links && Array.isArray(tower.links)) {
        tower.links.forEach((link) => {
          chartData.push({
            date: link.linkName,
            value: link.avgRsl,
          });
        });
      }
    });
    return chartData;
  };

  
  // ✅ FIXED: Pie Chart untuk Status Distribution
  const generatePieChartData = () => {
    if (!monthlyData || !monthlyData.data) return [];
    const statusCount = {
      too_strong: 0,
      optimal: 0,
      warning: 0,
      sub_optimal: 0,
      critical: 0,
    };
    monthlyData.data.forEach((tower) => {
      if (tower.links && Array.isArray(tower.links)) {
        tower.links.forEach((link) => {
          const status = getRslStatus(link.avgRsl);
          statusCount[status as keyof typeof statusCount]++;
        });
      }
    });
    const pieData = [
      { name: "Too Strong", value: statusCount.too_strong, fill: "#ef4444" },
      { name: "Optimal", value: statusCount.optimal, fill: "#10b981" },
      { name: "Warning", value: statusCount.warning, fill: "#f59e0b" },
      { name: "Sub-optimal", value: statusCount.sub_optimal, fill: "#fb923c" },
      { name: "Critical", value: statusCount.critical, fill: "#dc2626" },
    ].filter((item) => item.value > 0);
    return pieData;
  };
  // ✅ FIXED: Yearly Chart Data
  const generateYearlyChartData = () => {
    if (!yearlyData || !yearlyData.towers) return [];
    const monthlyAverages: Record<string, { sum: number; count: number }> = {};
    yearlyData.towers.forEach((tower) => {
      Object.entries(tower.links).forEach(([linkName, linkData]) => {
        Object.entries(linkData.monthlyAvg).forEach(([month, value]) => {
          if (!monthlyAverages[month]) {
            monthlyAverages[month] = { sum: 0, count: 0 };
          }
          monthlyAverages[month].sum += value;
          monthlyAverages[month].count++;
        });
      });
    });
    // Convert ke array untuk chart
    const chartData = Object.entries(monthlyAverages).map(([month, data]) => ({
      date: month,
      value: Math.round((data.sum / data.count) * 10) / 10, // Rata-rata dengan 1 desimal
    }));
    // Sort by month order
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    chartData.sort((a, b) => {
      const aMonth = a.date.split("-")[0];
      const bMonth = b.date.split("-")[0];
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });
    return chartData;
  };

  const isStatusActive = (
    status: number | string | null | undefined
  ): boolean => {
    if (!status || status === 0) return true;
    if (typeof status === "string" && status.toLowerCase() === "active")
      return true;
    return false;
  };

  // Render monthly chart
  const renderMonthlyChart = () => {
    if (!monthlyData)
      return <div className="text-center text-gray-500">Memuat data...</div>;
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">
          Performa Bulanan - {monthlyData.period}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Garis Rata-rata RSL</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={generateLineChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status Link</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={generatePieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      typeof percent === "number"
                        ? `${name}: ${(percent * 100).toFixed(0)}%`
                        : `${name}: 0%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generatePieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} links`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Per Tower</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {monthlyData.data.map((tower, idx) => (
                  <div key={idx} className="mb-6 border-b pb-4">
                    <h4 className="font-semibold text-lg mb-2">
                      {tower.towerName}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Link</TableHead>
                          <TableHead>Rata-rata RSL</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tower.links.map((link, linkIdx) => (
                          <TableRow key={linkIdx}>
                            <TableCell>{link.linkName}</TableCell>
                            <TableCell>{link.avgRsl.toFixed(1)} dBm</TableCell>
                            <TableCell>
                              {/* ✅ STATUS OPERASIONAL */}
                              <span
                                className={
                                  getOperationalStatusDisplay(link.status)
                                    .className
                                }
                              >
                                {getOperationalStatusDisplay(link.status).label}
                              </span>
                            </TableCell>
                            <TableCell>
                              {/* ✅ KETERANGAN = PERINGATAN RSL */}
                              {link.warningMessage || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  // Render yearly chart
  const renderYearlyChart = () => {
    if (!yearlyData)
      return <div className="text-center text-gray-500">Memuat data...</div>;
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">
          Ringkasan Tahunan - {yearlyData.year}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Area Rata-rata Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={generateYearlyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[-70, -30]} />
                  <Tooltip />
                  <Legend />
                  {/* ✅ UPDATE INI */}
                  <ReferenceLine
                    y={-45}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label="Optimal Max (-45)"
                  />
                  <ReferenceLine
                    y={-55}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label="Warning (-55)"
                  />
                  <ReferenceLine
                    y={-60}
                    stroke="#fb923c"
                    strokeDasharray="3 3"
                    label="Sub-optimal (-60)"
                  />
                  <ReferenceLine
                    y={-65}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    label="Critical (-65)"
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Statistik Tahunan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yearlyData.towers.map((tower, idx) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{tower.towerName}</h4>
                    {Object.entries(tower.links).map(([linkName, linkData]) => (
                      <div key={linkName} className="mb-4">
                        <h5 className="font-medium">{linkName}</h5>
                        <p className="text-sm text-gray-600">
                          Rata-rata Tahunan: {linkData.yearlyAvg.toFixed(1)} dBm
                        </p>
                        {linkData.warnings.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-sm font-semibold text-red-600">
                              Peringatan:
                            </h6>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {linkData.warnings.map((warning, wIdx) => (
                                <li key={wIdx}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histori Jaringan NEC</h1>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Kembali ke Dashboard
          </Button>
          <Button onClick={() => navigate("/nec-management")} variant="outline">
            <Settings className="mr-2 h-4 w-4" /> Kelola Tower & Link
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Impor Excel
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Ekspor Tahunan
          </Button>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="history">Daftar History</TabsTrigger>
          <TabsTrigger value="pivot">Pivot Table</TabsTrigger>
          <TabsTrigger value="monthly">Grafik Bulanan</TabsTrigger>
          <TabsTrigger value="yearly">Grafik Tahunan</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Daftar History RSL</CardTitle>
                <Button onClick={() => openModal("create")}>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Cari history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        fetchHistories(
                          1,
                          searchTerm,
                          selectedLink ?? undefined
                        );
                      }
                    }}
                  />
                </div>
                <Select
                  value={selectedLink?.toString() || "all"} // ✅ Changed from ""
                  onValueChange={(value) => {
                    setSelectedLink(value === "all" ? null : parseInt(value)); // ✅ Changed
                    fetchHistories(
                      1,
                      searchTerm,
                      value === "all" ? undefined : parseInt(value) // ✅ Changed
                    );
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Link</SelectItem>{" "}
                    {/* ✅ Changed from "" */}
                    {links.map((link) => (
                      <SelectItem key={link.id} value={link.id.toString()}>
                        {link.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    fetchHistories(1, searchTerm, selectedLink ?? undefined)
                  }
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Memuat data...</span>
                </div>
              ) : (
                <>
                  {histories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Link</TableHead>
                          {/* <TableHead>Tower Near End</TableHead> */}
                          {/* <TableHead>Tower Far End</TableHead> */}
                          <TableHead>RSL</TableHead>{" "}
                          {/* ✅ Diubah jadi RSL saja */}
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {histories.map((history) => (
                          <TableRow key={history.id}>
                            <TableCell>{history.no || history.id}</TableCell>
                            <TableCell>
                              {format(new Date(history.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="font-medium">
                              {history.linkName}
                            </TableCell>
                            {/* <TableCell>{history.nearEndTower}</TableCell> */}
                            {/* <TableCell>{history.farEndTower}</TableCell> */}
                            <TableCell>
                              <div className="flex flex-col">
                                {isStatusActive(history.status) ? (
                                  <>
                                    <span className={`font-mono font-semibold ${getRslTextColor(history.rslNearEnd)}`}>
                                      {history.rslNearEnd?.toFixed(1) ?? "N/A"} dBm
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                      {getRslStatusLabel(history.rslNearEnd)}
                                    </span>
                                  </>
                                ) : (
                                  <div className="space-y-1">
                                    <span className={getOperationalStatusDisplay(history.status).className}>
                                      {getOperationalStatusDisplay(history.status).label}
                                    </span>
                                    {history.notes && (
                                      <p className="text-xs text-gray-600 italic">{history.notes}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openModal("edit", history)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(history.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert className="mt-4">
                      <AlertDescription className="flex flex-col items-center justify-center py-8">
                        <div className="text-gray-400 mb-2">
                          <Search className="h-12 w-12" />
                        </div>
                        <p className="text-lg font-medium">
                          Tidak ada data history
                        </p>
                        <p className="text-gray-600 mt-1">
                          {searchTerm || selectedLink
                            ? "Coba ubah filter pencarian"
                            : "Klik 'Tambah Data' untuk menambahkan data RSL"}
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        disabled={currentPage <= 1}
                        onClick={() =>
                          fetchHistories(
                            currentPage - 1,
                            searchTerm,
                            selectedLink ?? undefined
                          )
                        }
                      >
                        Sebelumnya
                      </Button>
                      <span>
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <Button
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          fetchHistories(
                            currentPage + 1,
                            searchTerm,
                            selectedLink ?? undefined
                          )
                        }
                      >
                        Berikutnya
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pivot">
          <NecRslPivotTable />
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Grafik Performa Bulanan</CardTitle>
                <div className="flex space-x-4">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears(histories).map((year) => (
                        <SelectItem
                          key={year.toString()}
                          value={year.toString()}
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(0, month - 1).toLocaleString("id-ID", {
                              month: "long",
                            })}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderMonthlyChart()}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearly">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Grafik Ringkasan Tahunan</CardTitle>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>{renderYearlyChart()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Modal for Create/Edit History */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create"
                ? "Tambah Data History"
                : "Edit Data History"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="necLinkId">Link</Label>
                <Select
                  required
                  value={formData.necLinkId.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      necLinkId: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Link" />
                  </SelectTrigger>
                  <SelectContent>
                    {links.map((link) => (
                      <SelectItem key={link.id} value={link.id.toString()}>
                        {link.name} ({link.nearEndTower} → {link.farEndTower})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rslNearEnd">
                  RSL Near End (dBm)
                  {formData.status !== "active" && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Otomatis diisi -100 untuk non-active status)
                    </span>
                  )}
                </Label>
                <Input
                  id="rslNearEnd"
                  type="number"
                  name="rslNearEnd"
                  step="0.1"
                  min="-100"
                  max="-10"
                  value={formData.rslNearEnd}
                  onChange={handleInputChange}
                  required={formData.status === "active"}
                  disabled={formData.status !== "active"} // ✅ DISABLED
                  className={formData.status !== "active" ? "bg-gray-100" : ""}
                />
              </div>
              {/* ✅ NOTES FIELD */}
              <div>
                <Label htmlFor="notes">
                  Catatan{" "}
                  {formData.status !== "active" && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Contoh: Link dismantled, pindah ke tower lain"
                  required={formData.status !== "active"} // ✅ WAJIB untuk non-active
                />
                {formData.status !== "active" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Catatan wajib diisi untuk status non-active
                  </p>
                )}
              </div>
              {/* ✅ STATUS FIELD */}
              <div>
                <Label htmlFor="status">Status Operasional</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="dismantled">Dismantled</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                    <SelectItem value="obstacle">Obstacle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {modalMode === "create" ? "Simpan" : "Perbarui"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal for Import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Impor Data dari Excel</DialogTitle>
            <DialogDescription>
              Pilih format Excel yang sesuai dengan file Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-semibold mb-3 block">
                Format File Excel:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setImportFormat("pivot")}
                  className="h-auto py-3 flex-col items-start"
                >
                  <div className="font-semibold">Pivot/Monthly Format</div>
                  <div className="text-xs text-left mt-1 opacity-80">
                    No | Link | Jan-25 | Feb-25 | ...
                  </div>
                </Button>
              </div>
            </div>
            {/* Format Info */}
            <Alert>
              <AlertDescription className="space-y-2">
                {importFormat === "pivot" ? (
                  <>
                    <p className="font-semibold">
                      Format Pivot (yang Anda gunakan):
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>
                        <strong>Kolom A:</strong> No (opsional)
                      </li>
                      <li>
                        <strong>Kolom B:</strong> Link Name (contoh: M5 to
                        Hasari)
                      </li>
                      <li>
                        <strong>Kolom C+:</strong> Jan-25, Feb-25, Mar-25, dst
                      </li>
                      <li>
                        <strong>Data:</strong> RSL values dalam setiap cell
                      </li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      ✅ Tanggal akan di-set ke tanggal 15 setiap bulan
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Format Row Per Date:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>
                        <strong>Kolom A:</strong> Date (2025-01-15)
                      </li>
                      <li>
                        <strong>Kolom B:</strong> Link Name
                      </li>
                      <li>
                        <strong>Kolom C:</strong> RSL Near End
                      </li>
                      <li>
                        <strong>Kolom D:</strong> RSL Far End (optional)
                      </li>
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              {importFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {importFile.name}
                </p>
              )}
            </div>
            {/* Import Result */}
            {importResult && (
              <Alert
                className={
                  importResult.failedRows > 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }
              >
                <AlertDescription>
                  <p className="font-semibold">{importResult.message}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                    <div>
                      <span className="font-medium">Diproses:</span>{" "}
                      {importResult.totalRowsProcessed}
                    </div>
                    <div className="text-green-700">
                      <span className="font-medium">Berhasil:</span>{" "}
                      {importResult.successfulInserts}
                    </div>
                    <div className="text-red-700">
                      <span className="font-medium">Gagal:</span>{" "}
                      {importResult.failedRows}
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Errors:</p>
                      <ScrollArea className="h-32 border rounded p-2 bg-white">
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {importResult.errors.map((error, idx) => (
                            <li key={idx} className="text-red-600">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportResult(null);
                setImportFile(null);
              }}
            >
              Tutup
            </Button>
            <Button onClick={handleImport} disabled={!importFile}>
              <Upload className="mr-2 h-4 w-4" />
              Impor ({importFormat === "pivot" ? "Pivot" : "Row"})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default NecHistoryPage;
