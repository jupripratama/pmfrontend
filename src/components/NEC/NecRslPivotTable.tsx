import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { necSignalApi } from "../../services/necSignalService";
import type { NecYearlyPivotDto } from "../../types/necSignal";

// Threshold RSL
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

// Status RSL
const getRslStatus = (value: number | null): string => {
  if (value === null) return "no_data";
  if (
    value > RSL_THRESHOLDS.TOO_STRONG_MIN &&
    value <= RSL_THRESHOLDS.TOO_STRONG_MAX
  )
    return "too_strong";
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

// Warna latar untuk cell
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

// Warna teks
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

// Label status
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

interface PivotData {
  linkName: string;
  tower: string;
  monthlyValues: Record<string, number | null>;
  expectedRslMin: number;
  expectedRslMax: number;
  notes?: Record<string, string>;
}

const NecRslPivotTable: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pivotData, setPivotData] = useState<PivotData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTower, setSelectedTower] = useState<string>("all");
  const [towers, setTowers] = useState<string[]>([]);

  const [hoveredCell, setHoveredCell] = useState<{
    rowIdx: number;
    colIdx: number;
    linkName: string;
    month: string;
    value: number | null;
    note?: string;
  } | null>(null);


  // Note editing
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    linkName: string;
    month: string;
    currentNote?: string;
  } | null>(null);
  const [noteText, setNoteText] = useState("");

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

  const formatMonthKey = (month: string): string => {
    return `${month}-${selectedYear.toString().slice(-2)}`;
  };

  // Fetch hanya tower unik (untuk dropdown)
  const fetchAvailableTowers = async () => {
    try {
      const allData = await necSignalApi.getYearlyPivot(selectedYear);
      const uniqueTowers = Array.from(
        new Set(allData.map((d) => d.tower))
      ).sort();
      setTowers(uniqueTowers);
    } catch (error) {
      console.error("Error fetching towers:", error);
    }
  };

  // Fetch data pivot (dengan filter tower)
  const fetchYearlyData = async () => {
    setIsLoading(true);
    try {
      const response = await necSignalApi.getYearlyPivot(
        selectedYear,
        selectedTower === "all" ? undefined : selectedTower
      );

      const formattedData: PivotData[] = response.map((item) => ({
        linkName: item.linkName,
        tower: item.tower,
        monthlyValues: item.monthlyValues,
        expectedRslMin: item.expectedRslMin || -60,
        expectedRslMax: item.expectedRslMax || -40,
        notes: item.notes || {},
      }));

      setPivotData(formattedData);
    } catch (error) {
      console.error("Error fetching pivot data:", error);
      setPivotData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTowers();
  }, [selectedYear]);

  useEffect(() => {
    fetchYearlyData();
  }, [selectedYear, selectedTower]);

  // Pie chart data
  const generatePieChartData = () => {
    if (!pivotData || pivotData.length === 0) return [];
    
    const statusCount = {
      too_strong: 0,
      optimal: 0,
      warning: 0,
      sub_optimal: 0,
      critical: 0,
    };
  
    pivotData.forEach((link) => {
      Object.values(link.monthlyValues).forEach((value) => {
        // ✅ Only count valid values (skip null/undefined)
        if (value !== null && value !== undefined) {
          const status = getRslStatus(value);
          if (status !== "no_data") {
            statusCount[status as keyof typeof statusCount]++;
          }
        }
      });
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

  // Line chart data
  const prepareChartData = () => {
    const chartData: Array<{
      month: string;
      [key: string]: string | number | null | undefined;
    }> = months.map((month) => ({ month }));
  
    pivotData.forEach((link) => {
      months.forEach((month) => {
        const key = formatMonthKey(month);
        const value = link.monthlyValues[key];
        // ✅ Only include valid (non-null) values in chart
        chartData[months.indexOf(month)][link.linkName] = 
          value !== null && value !== undefined ? value : null;
      });
    });

    return chartData;
  };

  // Note modal
  const openNoteModal = (
    linkName: string,
    month: string,
    currentNote?: string
  ) => {
    setEditingNote({ linkName, month, currentNote });
    setNoteText(currentNote || "");
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    if (!editingNote) return;

    setPivotData((prev) =>
      prev.map((link) => {
        if (link.linkName === editingNote.linkName) {
          return {
            ...link,
            notes: { ...link.notes, [editingNote.month]: noteText },
          };
        }
        return link;
      })
    );

    setIsNoteModalOpen(false);
    setEditingNote(null);
    setNoteText("");
  };

  // Data untuk chart
  const chartData = prepareChartData();
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>RSL History - Pivot Table ({selectedYear})</CardTitle>
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
                <span className={`mr-2 ${isLoading ? "animate-spin" : ""}`}>
                  ↻
                </span>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Garis Rata-rata RSL</CardTitle>
          </CardHeader>
          <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={0}
                textAnchor="middle"
                height={50}
              />
              <YAxis domain={[-70, -30]} />
              <Tooltip 
                formatter={(value) => {
                  // ✅ Handle null values in tooltip
                  if (value === null || value === undefined) return "No Data";
                  return `${value} dBm`;
                }}
              />
              <Legend />
              
              {/* Reference Lines */}
              <ReferenceLine y={-45} stroke="#10b981" strokeDasharray="3 3" label="Optimal Max" />
              <ReferenceLine y={-55} stroke="#f59e0b" strokeDasharray="3 3" label="Warning" />
              <ReferenceLine y={-60} stroke="#fb923c" strokeDasharray="3 3" label="Sub-optimal" />
              <ReferenceLine y={-65} stroke="#dc2626" strokeDasharray="3 3" label="Critical" />
              
              {pivotData.slice(0, 6).map((link, idx) => (
                <Line
                  key={link.linkName}
                  type="monotone"
                  dataKey={link.linkName}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false} // ✅ Don't connect null values
                />
              ))}
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
                  label={(entry) =>
                    `${entry.name ?? ""}: ${(
                      (entry.percent ?? 0) * 100
                    ).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {generatePieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} data points`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pivot Table */}
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
                    <tr className="bg-blue-600 text-white">
                      <th className="border px-4 py-3 sticky left-0 bg-blue-600 z-10 min-w-[60px]">
                        No
                      </th>
                      <th className="border px-4 py-3 sticky left-[60px] bg-blue-600 z-10 min-w-[220px]">
                        Link
                      </th>
                      <th colSpan={12} className="border px-4 py-3">
                        RSL - dBm
                      </th>
                    </tr>
                    <tr className="bg-blue-500 text-white">
                      <th className="border px-4 py-2"></th>
                      <th className="border px-4 py-2"></th>
                      {months.map((month, idx) => (
                        <th
                          key={idx}
                          className="border px-3 py-2 min-w-[100px]"
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
                      className="group hover:bg-gray-50" // ✅ group di TR (parent)
                    >
                      <td className="border px-4 py-3 text-center sticky left-0 bg-white z-10">
                        {rowIdx + 1}
                      </td>
                      <td className="border px-4 py-3 sticky left-[60px] bg-white z-10">
                        <div className="font-semibold">{row.linkName}</div>
                        <div className="text-xs text-gray-500">Tower: {row.tower}</div>
                      </td>
                      
                      {months.map((month, monthIdx) => {
                        const key = formatMonthKey(month);
                        const value = row.monthlyValues[key];
                        const note = row.notes?.[key];
                        const isDataPresent = value !== null && value !== undefined;
                        
                        return (
                          <td
                            key={monthIdx}
                            onMouseEnter={() => setHoveredCell({
                              rowIdx,
                              colIdx: monthIdx,
                              linkName: row.linkName,
                              month: month,
                              value: value,
                              note: note
                            })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`border px-2 py-2 text-center font-mono relative cursor-pointer ${
                              isDataPresent 
                                ? `${getRslColor(value)} ${getRslTextColor(value)}`
                                : 'bg-gray-50'
                            } ${
                              hoveredCell?.rowIdx === rowIdx && hoveredCell?.colIdx === monthIdx
                                ? 'ring-2 ring-blue-500'
                                : ''
                            }`}
                          >
                            {/* Content */}
                            {isDataPresent ? (
                              <>
                                <div className="font-bold">
                                  {value.toFixed(1)}
                                  {note && <span className="ml-1 text-blue-600 text-xs">📝</span>}
                                </div>
                                <div className="text-xs opacity-75">dBm</div>
                              </>
                            ) : note ? (
                              <div className="text-xs text-gray-600 italic px-1">
                                {note.length > 20 ? `${note.substring(0, 20)}...` : note}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">-</div>
                            )}
                            
                            {/* ✅ Tooltip - PASTIKAN di DALAM td */}
                              {hoveredCell?.rowIdx === rowIdx && hoveredCell?.colIdx === monthIdx && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
                                {/* Tooltip content */}
                                <div className="relative">
                                  {/* Arrow */}
                                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                                  
                                  {/* Content */}
                                  <div className="mb-2">
                                    <h4 className="font-bold">{row.linkName}</h4>
                                    <p className="text-gray-300 text-xs">{month} {selectedYear}</p>
                                  </div>
                                  
                                  {isDataPresent && (
                                    <div className="mb-3">
                                      <p className="text-lg font-bold">{value?.toFixed(1)} dBm</p>
                                      <span className={`px-2 py-1 rounded text-xs text-black font-medium ${
                                      getRslColor(value).replace('bg-', 'bg-')
                                    }`}>
                                      {getRslStatusLabel(value)}
                                    </span>
                                    </div>
                                  )}
                                  
                                  {note && (
                                    <div className="mb-3 p-2 bg-yellow-900/30 rounded">
                                      <p className="font-semibold">📝 Catatan:</p>
                                      <p className="text-sm">{note}</p>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => openNoteModal(row.linkName, key, note)}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                                  >
                                    {note ? "✏️ Edit Note" : "📝 Add Note"}
                                  </button>
                                </div>
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

              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-2">Status Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-red-200 border rounded"></div>
                    <span>Too Strong (-30 to -45)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-green-200 border rounded"></div>
                    <span>Optimal (-45 to -55)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-yellow-200 border rounded"></div>
                    <span>Warning (-55 to -60)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-orange-200 border rounded"></div>
                    <span>Sub-optimal (-60 to -65)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-red-300 border rounded"></div>
                    <span>Critical (&lt; -65)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-gray-100 border rounded"></div>
                    <span>No Data</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                No RSL data found for {selectedYear}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNote?.currentNote ? "Edit" : "Add"} Note
            </DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              <div>
                <Label>Link</Label>
                <p className="text-sm font-semibold">{editingNote.linkName}</p>
              </div>
              <div>
                <Label>Month</Label>
                <p className="text-sm font-semibold">{editingNote.month}</p>
              </div>
              <div>
                <Label htmlFor="note">Note/Keterangan</Label>
                <textarea
                  id="note"
                  className="w-full p-2 border rounded"
                  placeholder="Contoh: Maintenance, Dismantled, Obstacle, dll"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NecRslPivotTable;
