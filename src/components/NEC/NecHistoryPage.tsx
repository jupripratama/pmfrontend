import React, { useState, useEffect, useRef } from "react";
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
  });

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
      const result = await necSignalApi.getHistories(query);
      setHistories(result.data);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error) {
      console.error("Error fetching histories:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch towers and links for dropdowns
  const fetchTowersAndLinks = async () => {
    try {
      const towersResult = await necSignalApi.getTowers();
      const linksResult = await necSignalApi.getLinks();
      setTowers(towersResult.map((t) => ({ id: t.id, name: t.name })));
      setLinks(
        linksResult.map((l) => ({
          id: l.id,
          name: l.linkName,
          nearEndTower: l.nearEndTower,
          farEndTower: l.farEndTower,
        }))
      );
    } catch (error) {
      console.error("Error fetching towers/links:", error);
    }
  };

  // Fetch monthly data for chart
  const fetchMonthlyData = async () => {
    if (!selectedYear || !selectedMonth) return;
    try {
      const result = await necSignalApi.getMonthly(selectedYear, selectedMonth);
      setMonthlyData(result);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
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
      setFormData({
        necLinkId: history.necLinkId,
        date: format(new Date(history.date), "yyyy-MM-dd"),
        rslNearEnd: history.rslNearEnd,
        rslFarEnd: history.rslFarEnd || 0,
      });
    } else {
      setCurrentHistory(null);
      setFormData({
        necLinkId: 0,
        date: "",
        rslNearEnd: 0,
        rslFarEnd: 0,
      });
    }
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await necSignalApi.createHistory(formData);
        toast({
          title: "Berhasil",
          description: "Data history berhasil ditambahkan.",
        });
      } else {
        if (currentHistory) {
          await necSignalApi.updateHistory(currentHistory.id, {
            rslNearEnd: formData.rslNearEnd,
            rslFarEnd: formData.rslFarEnd,
          });
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
      const result = await necSignalApi.importExcel({ excelFile: importFile });
      setImportResult(result);
      toast({
        title: "Impor Selesai",
        description: result.message,
      });
      setIsImportModalOpen(false);
      setImportFile(null);
      fetchHistories();
    } catch (error) {
      console.error("Error importing file:", error);
      toast({
        title: "Error",
        description: "Gagal mengimpor file Excel.",
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
    if (!monthlyData) return [];
    const chartData: HistoryDataPoint[] = [];
    monthlyData.data.forEach((tower) => {
      tower.links.forEach((link) => {
        chartData.push({
          date: link.linkName,
          value: link.avgRsl,
        });
      });
    });
    return chartData;
  };

  const generatePieChartData = () => {
    if (!monthlyData) return [];
    const chartData: { name: string; value: number; fill: string }[] = [];
    monthlyData.data.forEach((tower) => {
      tower.links.forEach((link) => {
        chartData.push({
          name: link.linkName,
          value: link.avgRsl,
          fill:
            link.status === "normal"
              ? "#10B981"
              : link.status === "warning_high"
              ? "#F59E0B"
              : "#EF4444",
        });
      });
    });
    return chartData;
  };

  const generateYearlyChartData = () => {
    if (!yearlyData) return [];
    const chartData: HistoryDataPoint[] = [];
    yearlyData.towers.forEach((tower) => {
      Object.entries(tower.links).forEach(([linkName, linkData]) => {
        const months = Object.keys(linkData.monthlyAvg).map((month) => ({
          name: month,
          date: month,
          value: linkData.monthlyAvg[month],
        }));
        chartData.push(
          ...months.map((m) => ({
            date: m.date,
            value: m.value,
          }))
        );
      });
    });
    return chartData;
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
              <CardTitle>Grafik Pie Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={generatePieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generatePieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
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
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  link.status === "normal"
                                    ? "bg-green-100 text-green-800"
                                    : link.status === "warning_high"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {link.status === "normal"
                                  ? "Normal"
                                  : link.status === "warning_high"
                                  ? "Terlalu Kuat"
                                  : "Terlalu Lemah"}
                              </span>
                            </TableCell>
                            <TableCell>{link.warningMessage || "-"}</TableCell>
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
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
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
                  value={selectedLink?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedLink(value ? parseInt(value) : null);
                    fetchHistories(
                      1,
                      searchTerm,
                      value ? parseInt(value) : undefined
                    );
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Link</SelectItem>
                    {links.map((link) => (
                      <SelectItem key={link.id} value={link.id.toString()}>
                        {link.name} ({link.nearEndTower} → {link.farEndTower})
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
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Tower Near End</TableHead>
                        <TableHead>Tower Far End</TableHead>
                        <TableHead>RSL Near End</TableHead>
                        <TableHead>RSL Far End</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {histories.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>{history.no}</TableCell>
                          <TableCell>
                            {format(new Date(history.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{history.linkName}</TableCell>
                          <TableCell>{history.nearEndTower}</TableCell>
                          <TableCell>{history.farEndTower}</TableCell>
                          <TableCell>
                            {history.rslNearEnd.toFixed(1)} dBm
                          </TableCell>
                          <TableCell>
                            {history.rslFarEnd
                              ? `${history.rslFarEnd.toFixed(1)} dBm`
                              : "-"}
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

                  {histories.length === 0 && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        Tidak ada data history yang ditemukan.
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
                <Label htmlFor="rslNearEnd">RSL Near End (dBm)</Label>
                <Input
                  id="rslNearEnd"
                  type="number"
                  name="rslNearEnd"
                  step="0.1"
                  min="-100"
                  max="-10"
                  value={formData.rslNearEnd}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rslFarEnd">RSL Far End (dBm)</Label>
                <Input
                  id="rslFarEnd"
                  type="number"
                  name="rslFarEnd"
                  step="0.1"
                  min="-100"
                  max="-10"
                  value={formData.rslFarEnd}
                  onChange={handleInputChange}
                />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impor Data dari Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            {importResult && (
              <Alert
                className={`mt-4 ${
                  importResult.failedRows > 0
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <AlertDescription>
                  <strong>{importResult.message}</strong>
                  <br />
                  Total baris diproses: {importResult.totalRowsProcessed}
                  <br />
                  Berhasil: {importResult.successfulInserts}
                  <br />
                  Gagal: {importResult.failedRows}
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Error:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {importResult.errors
                          .slice(0, 5)
                          .map((error: string, idx: number) => (
                            <li key={idx}>{error}</li>
                          ))}
                        {importResult.errors.length > 5 && (
                          <li>dan {importResult.errors.length - 5} lagi...</li>
                        )}
                      </ul>
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
              onClick={() => setIsImportModalOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleImport}>Impor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NecHistoryPage;
