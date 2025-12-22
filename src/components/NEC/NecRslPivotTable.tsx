import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { necSignalApi } from "../../services/necSignalService";
import {
  NecYearlyPivotDto,
  NecChartData,
  NecTowerStats,
} from "../../types/necSignal";
import { toast } from "@/hooks/use-toast";

const NecRslPivotTable: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pivotData, setPivotData] = useState<NecYearlyPivotDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTower, setSelectedTower] = useState<string>("all");
  const [activeView, setActiveView] = useState<"table" | "chart">("table");
  const [towers, setTowers] = useState<string[]>([]);

  const months = [
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

  // Extract tower name dari link (contoh: "PTH to MS" → "PTH")
  const extractTowerFromLink = (linkName: string): string => {
    const parts = linkName.split(" to ");
    return parts[0] || linkName;
  };

  // Format bulan untuk key (Jan-25)
  const formatMonthKey = (month: string): string => {
    return `${month}-${selectedYear.toString().slice(-2)}`;
  };

  // Fetch data pivot dari API yang sudah ada
  const fetchYearlyData = async () => {
    setIsLoading(true);
    try {
      console.log(
        "📡 Fetching pivot data for year:",
        selectedYear,
        "tower:",
        selectedTower
      );

      const data = await necSignalApi.getYearlyPivot(
        selectedYear,
        selectedTower === "all" ? undefined : selectedTower
      );

      console.log("📊 Raw API Response:", data);
      console.log("📊 First item structure:", data[0]);
      console.log("📊 First item monthlyValues:", data[0]?.monthlyValues);

      // Format data dengan benar
      const formattedData = data.map((item, index) => {
        console.log(`📊 Item ${index}:`, {
          linkName: item.linkName,
          tower: item.tower,
          monthlyValuesKeys: Object.keys(item.monthlyValues || {}),
          monthlyValuesSample: item.monthlyValues
            ? Object.entries(item.monthlyValues).slice(0, 3)
            : "No monthlyValues",
        });

        const completeMonthlyValues: Record<string, number | null> = {};

        months.forEach((month) => {
          const key = formatMonthKey(month);
          // Cek apakah nilai ada, jika tidak set null
          completeMonthlyValues[key] = item.monthlyValues?.[key] ?? null;
        });

        return {
          ...item,
          tower: item.tower || extractTowerFromLink(item.linkName),
          monthlyValues: completeMonthlyValues,
          expectedRslMin: item.expectedRslMin || -60,
          expectedRslMax: item.expectedRslMax || -40,
        };
      });

      console.log("✅ Formatted data sample:", formattedData[0]);
      console.log("✅ Total formatted items:", formattedData.length);

      setPivotData(formattedData);

      toast({
        title: "Data Loaded",
        description: `${formattedData.length} links loaded for ${selectedYear}`,
      });
    } catch (error) {
      console.error("❌ Error fetching pivot data:", error);
      toast({
        title: "Error",
        description: "Failed to load pivot data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch towers untuk dropdown filter
  const fetchTowers = async () => {
    try {
      // Coba ambil dari API towers
      const towerData = await necSignalApi.getTowers();
      const towerNames = towerData.map((t) => t.name);
      setTowers(towerNames);
    } catch (error) {
      console.error(
        "Error fetching towers, extracting from pivot data:",
        error
      );
      // Fallback: extract dari data yang sudah dimuat
      const towerNames = Array.from(
        new Set(pivotData.map((d) => d.tower))
      ).sort();
      setTowers(towerNames);
    }
  };

  useEffect(() => {
    fetchYearlyData();
  }, [selectedYear, selectedTower]);

  useEffect(() => {
    if (pivotData.length > 0) {
      const towerNames = Array.from(
        new Set(pivotData.map((d) => d.tower))
      ).sort();
      setTowers(towerNames);
    }
  }, [pivotData]);

  // Color coding berdasarkan nilai RSL dan expected range
  const getRslColor = (
    value: number | null,
    expectedMin: number,
    expectedMax: number
  ): string => {
    if (value === null) return "bg-gray-100";

    const normalMin = expectedMin || -60;
    const normalMax = expectedMax || -40;

    if (value > normalMax) return "bg-red-200"; // Terlalu kuat
    if (value >= normalMax - 15) return "bg-green-200"; // Optimal
    if (value >= normalMin + 5) return "bg-yellow-200"; // Warning
    if (value >= normalMin) return "bg-orange-200"; // Sub-optimal
    return "bg-red-300"; // Critical
  };

  const getRslTextColor = (
    value: number | null,
    expectedMin: number,
    expectedMax: number
  ): string => {
    if (value === null) return "text-gray-400";

    const normalMin = expectedMin || -60;
    const normalMax = expectedMax || -40;

    if (value > normalMax) return "text-red-800";
    if (value >= normalMax - 15) return "text-green-800";
    if (value >= normalMin + 5) return "text-yellow-800";
    if (value >= normalMin) return "text-orange-800";
    return "text-red-900";
  };

  const handleExport = async () => {
    try {
      await necSignalApi.exportYearlyExcel(
        selectedYear,
        selectedTower === "all" ? undefined : selectedTower
      );
      toast({
        title: "Export Successful",
        description: `Data exported for ${selectedYear}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export data",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // CHART DATA PREPARATION
  // ============================================
  const prepareChartData = (): NecChartData[] => {
    const chartData: NecChartData[] = months.map((month, idx) => ({
      month: formatMonthKey(month),
      monthIndex: idx + 1,
    }));

    pivotData.forEach((link) => {
      months.forEach((month, idx) => {
        const key = formatMonthKey(month);
        const value = link.monthlyValues[key];
        chartData[idx][link.linkName] = value ?? null;
      });
    });

    return chartData;
  };

  // ============================================
  // TOWER STATISTICS
  // ============================================
  const calculateTowerStats = (): NecTowerStats[] => {
    const towerGroups = pivotData.reduce((acc, link) => {
      if (!acc[link.tower]) {
        acc[link.tower] = [];
      }
      acc[link.tower].push(link);
      return acc;
    }, {} as Record<string, NecYearlyPivotDto[]>);

    return Object.entries(towerGroups).map(([towerName, links]) => {
      let totalRsl = 0;
      let count = 0;
      let healthy = 0;
      let warning = 0;
      let critical = 0;

      links.forEach((link) => {
        Object.values(link.monthlyValues).forEach((value) => {
          if (value !== null) {
            totalRsl += value;
            count++;

            const normalMin = link.expectedRslMin || -60;
            const normalMax = link.expectedRslMax || -40;

            if (value >= normalMax - 15 && value <= normalMax) {
              healthy++;
            } else if (value >= normalMin + 5) {
              warning++;
            } else {
              critical++;
            }
          }
        });
      });

      return {
        towerName,
        totalLinks: links.length,
        avgRsl: count > 0 ? Math.round((totalRsl / count) * 10) / 10 : 0,
        healthyLinks: healthy,
        warningLinks: warning,
        criticalLinks: critical,
      };
    });
  };

  const towerStats = calculateTowerStats();
  const chartData = prepareChartData();

  // Dynamic colors for each link
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
  ];

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              RSL History - Pivot Table View ({selectedYear})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedTower} onValueChange={setSelectedTower}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter Tower" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Towers</SelectItem>
                  {towers.map((tower) => (
                    <SelectItem key={tower} value={tower}>
                      {tower}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchYearlyData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {towerStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {towerStats.map((stat) => (
            <Card key={stat.towerName}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.towerName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Total Links</span>
                    <span className="font-bold">{stat.totalLinks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Avg RSL</span>
                    <span className="font-bold">
                      {stat.avgRsl.toFixed(1)} dBm
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <div className="text-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      <div className="text-xs font-semibold">
                        {stat.healthyLinks}
                      </div>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mx-auto" />
                      <div className="text-xs font-semibold">
                        {stat.warningLinks}
                      </div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-4 w-4 text-red-600 mx-auto" />
                      <div className="text-xs font-semibold">
                        {stat.criticalLinks}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeView}
        onValueChange={(v) => setActiveView(v as "table" | "chart")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table">Pivot Table</TabsTrigger>
          <TabsTrigger value="chart">Charts</TabsTrigger>
        </TabsList>

        {/* PIVOT TABLE VIEW */}
        <TabsContent value="table">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Loading RSL data...</span>
                </div>
              ) : pivotData.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full border-collapse text-sm bg-white">
                      <thead>
                        {/* Header 1: Title */}
                        <tr className="bg-blue-600 text-white">
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold sticky left-0 bg-blue-600 z-10 min-w-[60px]">
                            No
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold sticky left-[60px] bg-blue-600 z-10 min-w-[220px]">
                            Link
                          </th>
                          <th
                            colSpan={12}
                            className="border border-gray-300 px-4 py-3 text-center font-bold"
                          >
                            RSL - dBm
                          </th>
                        </tr>

                        {/* Header 2: Month Names */}
                        <tr className="bg-blue-500 text-white">
                          <th className="border border-gray-300 px-4 py-2"></th>
                          <th className="border border-gray-300 px-4 py-2"></th>
                          {months.map((month, idx) => (
                            <th
                              key={idx}
                              className="border border-gray-300 px-3 py-2 text-center font-semibold min-w-[100px] whitespace-nowrap"
                            >
                              {formatMonthKey(month)}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {pivotData.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="hover:bg-gray-50 even:bg-gray-50/50"
                          >
                            {/* Column 1: No */}
                            <td className="border border-gray-300 px-4 py-3 text-center font-medium sticky left-0 bg-white z-10">
                              {rowIdx + 1}
                            </td>

                            {/* Column 2: Link Name */}
                            <td className="border border-gray-300 px-4 py-3 sticky left-[60px] bg-white z-10">
                              <div className="font-semibold text-gray-900">
                                {row.linkName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Tower: {row.tower}
                              </div>
                            </td>

                            {/* Columns 3-14: Monthly Values */}
                            {months.map((month, monthIdx) => {
                              const key = formatMonthKey(month);
                              const value = row.monthlyValues[key];

                              return (
                                <td
                                  key={monthIdx}
                                  className={`border border-gray-300 px-3 py-3 text-center font-mono text-sm ${getRslColor(
                                    value,
                                    row.expectedRslMin,
                                    row.expectedRslMax
                                  )} ${getRslTextColor(
                                    value,
                                    row.expectedRslMin,
                                    row.expectedRslMax
                                  )}`}
                                >
                                  <div className="font-bold">
                                    {value !== null && value !== undefined
                                      ? value.toFixed(1)
                                      : "-"}
                                  </div>
                                  {value !== null && value !== undefined && (
                                    <div className="text-xs opacity-75 mt-1">
                                      dBm
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend - Perbaikan */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Color Legend
                    </h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-green-200 border border-gray-300 rounded"></div>
                        <span className="font-medium">
                          Optimal (-45 to -30 dBm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-yellow-200 border border-gray-300 rounded"></div>
                        <span className="font-medium">
                          Warning (-55 to -45 dBm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-orange-200 border border-gray-300 rounded"></div>
                        <span className="font-medium">
                          Sub-optimal (-60 to -55 dBm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-red-200 border border-gray-300 rounded"></div>
                        <span className="font-medium">
                          Too Strong (&gt; -30 dBm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-red-300 border border-gray-300 rounded"></div>
                        <span className="font-medium">
                          Critical (&lt; -60 dBm)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                        <span className="font-medium">No Data</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Alert className="mt-4">
                  <AlertDescription>
                    No RSL data found for {selectedYear}.
                    {selectedTower !== "all" && ` Filter: ${selectedTower}`}
                    <br />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={fetchYearlyData}
                    >
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHART VIEW */}
        <TabsContent value="chart" className="space-y-4">
          {pivotData.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>RSL Trend Analysis - All Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        domain={[-100, -20]}
                        label={{
                          value: "RSL (dBm)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <ReferenceLine
                        y={-40}
                        stroke="red"
                        strokeDasharray="3 3"
                        label="Max Threshold"
                      />
                      <ReferenceLine
                        y={-60}
                        stroke="orange"
                        strokeDasharray="3 3"
                        label="Min Threshold"
                      />
                      {pivotData.slice(0, 10).map((link, idx) => (
                        <Line
                          key={link.linkName}
                          type="monotone"
                          dataKey={link.linkName}
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average RSL per Link ({selectedYear})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={pivotData.map((link) => {
                        const validValues = Object.values(
                          link.monthlyValues
                        ).filter((v) => v !== null) as number[];
                        const avgRsl =
                          validValues.length > 0
                            ? validValues.reduce((sum, v) => sum + v, 0) /
                              validValues.length
                            : 0;

                        return {
                          name: link.linkName,
                          avgRsl: avgRsl,
                          tower: link.tower,
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis
                        domain={[-100, -20]}
                        label={{
                          value: "Avg RSL (dBm)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <ReferenceLine
                        y={-40}
                        stroke="red"
                        strokeDasharray="3 3"
                      />
                      <ReferenceLine
                        y={-60}
                        stroke="orange"
                        strokeDasharray="3 3"
                      />
                      <Bar dataKey="avgRsl" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                No chart data available. Load data in Table view first.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NecRslPivotTable;
