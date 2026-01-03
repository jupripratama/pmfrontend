import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  BarChart3,
  LayoutGrid,
  List,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";
import { swrSignalApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import SwrSitesTable from "./SwrSitesTable";
import SwrChannelsTable from "./SwrChannelsTable";
import SwrSiteDialog from "./SwrSiteDialog";
import SwrChannelDialog from "./SwrChannelDialog";
import SwrPivotTable from "./SwrPivotTable";
import { SwrSiteListDto, SwrChannelListDto } from "@/types/swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SwrSignalPage() {
  const [sites, setSites] = useState<SwrSiteListDto[]>([]);
  const [channels, setChannels] = useState<SwrChannelListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSiteDialog, setShowSiteDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportInstructions, setShowImportInstructions] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingSite, setEditingSite] = useState<SwrSiteListDto | null>(null);
  const [editingChannel, setEditingChannel] =
    useState<SwrChannelListDto | null>(null);
  const { toast } = useToast();

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await swrSignalApi.getSites();
      setSites(data);
      console.log("✅ Sites loaded:", data.length);
    } catch (error: any) {
      console.error("❌ Error loading sites:", error);
      toast({
        title: "Error Loading Sites",
        description: error.message || "Failed to load sites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const data = await swrSignalApi.getChannels();
      setChannels(data);
      console.log("✅ Channels loaded:", data.length);
    } catch (error: any) {
      console.error("❌ Error loading channels:", error);
      toast({
        title: "Error Loading Channels",
        description: error.message || "Failed to load channels",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSites();
    loadChannels();
  }, []);

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      console.log("📤 Starting import:", importFile.name);

      const result = await swrSignalApi.importExcel(importFile);

      console.log("✅ Import completed:", result);

      setImportResult(result);

      if (result.failedRows === 0) {
        toast({
          title: "Import Successful",
          description: result.message,
        });
        setShowImportModal(false);
        setImportFile(null);
        // Refresh data
        loadSites();
        loadChannels();
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `${result.successfulInserts} succeeded, ${result.failedRows} failed`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSiteSaved = () => {
    setEditingSite(null);
    setShowSiteDialog(false);
    loadSites();
  };

  const handleChannelSaved = () => {
    setEditingChannel(null);
    setShowChannelDialog(false);
    loadChannels();
  };

  const handleEditSite = (site: SwrSiteListDto) => {
    setEditingSite(site);
    setShowSiteDialog(true);
  };

  const handleEditChannel = (channel: SwrChannelListDto) => {
    setEditingChannel(channel);
    setShowChannelDialog(true);
  };

  const handleDeleteSite = async (id: number) => {
    const site = sites.find((s) => s.id === id);
    if (!site) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${site.name}"?\n\n` +
        (site.channelCount > 0
          ? `⚠️ This site has ${site.channelCount} channel(s). Delete will fail if channels exist.`
          : "This action cannot be undone.")
    );

    if (!confirmed) return;

    try {
      console.log("🗑️ Attempting to delete site:", id);

      await swrSignalApi.deleteSite(id);

      toast({
        title: "Success",
        description: `Site "${site.name}" deleted successfully`,
      });

      loadSites();
    } catch (error: any) {
      console.error("❌ Delete site error:", error);

      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete site",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChannel = async (id: number) => {
    const channel = channels.find((c) => c.id === id);
    if (!channel) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${channel.channelName}" from ${channel.swrSiteName}?\n\n` +
        "⚠️ This will also delete all history records for this channel.\n" +
        "This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      console.log("🗑️ Attempting to delete channel:", id);

      await swrSignalApi.deleteChannel(id);

      toast({
        title: "Success",
        description: `Channel "${channel.channelName}" deleted successfully`,
      });

      loadChannels();
    } catch (error: any) {
      console.error("❌ Delete channel error:", error);

      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete channel",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template for both Trunking and Conventional
    const csvContent = `No,Channel,Jan-25 VSWR,Jan-25 FPWR,Feb-25 VSWR,Feb-25 FPWR,Mar-25 VSWR,Mar-25 FPWR
1,Channel 001,1.2,45.5,1.3,46.0,1.1,44.8
2,Channel 002,1.4,47.2,1.3,46.5,1.5,48.0
3,Channel 003,1.1,44.0,1.2,45.0,1.0,43.5`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SWR_Import_Template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
      description: "Template downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              SWR Signal Management
            </h1>
            <p className="text-purple-200">
              Monitor and manage your SWR sites and channels
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowImportInstructions(true)}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Import Guide
            </Button>
            <Button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 text-white"
            >
              <Upload className="w-4 h-4 mr-2" /> Import Excel
            </Button>
            <Button
              onClick={() => {
                setEditingSite(null);
                setShowSiteDialog(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Site
            </Button>
            <Button
              onClick={() => {
                setEditingChannel(null);
                setShowChannelDialog(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Channel
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-purple-900/30 border border-purple-500/20 mb-8 p-1">
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-purple-600 rounded-lg"
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger
              value="sites"
              className="data-[state=active]:bg-purple-600 rounded-lg"
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Sites ({sites.length})
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="data-[state=active]:bg-purple-600 rounded-lg"
            >
              <List className="w-4 h-4 mr-2" /> Channels ({channels.length})
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-0 outline-none">
            <SwrPivotTable />
          </TabsContent>

          {/* Sites Tab */}
          <TabsContent value="sites" className="mt-0 outline-none">
            <div className="flex justify-end mb-6">
              <Button
                variant="outline"
                onClick={() => loadSites()}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <SwrSitesTable
              sites={sites}
              loading={loading}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
            />
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="mt-0 outline-none">
            <div className="flex justify-end mb-6">
              <Button
                variant="outline"
                onClick={() => loadChannels()}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <SwrChannelsTable
              channels={channels}
              loading={loading}
              onEdit={handleEditChannel}
              onDelete={handleDeleteChannel}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <SwrSiteDialog
        open={showSiteDialog}
        onOpenChange={setShowSiteDialog}
        site={editingSite}
        onSaved={handleSiteSaved}
      />
      <SwrChannelDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        channel={editingChannel}
        sites={sites}
        onSaved={handleChannelSaved}
      />

      {/* Import Instructions Modal */}
      <Dialog
        open={showImportInstructions}
        onOpenChange={setShowImportInstructions}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Excel Import Instructions</DialogTitle>
            <DialogDescription>
              Follow these guidelines to import SWR data successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Required Format</AlertTitle>
              <AlertDescription>
                Your Excel file must follow this structure:
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📋 Column Structure:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Column A:</strong> Row Number (No)
                  </li>
                  <li>
                    <strong>Column B:</strong> Channel Name
                  </li>
                  <li>
                    <strong>Columns C onwards:</strong> Month columns (Jan-25,
                    Feb-25, etc.)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📅 Date Format:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Use format: <code>MMM-yy</code> (e.g., Jan-25, Feb-25)
                  </li>
                  <li>Or Excel date format</li>
                  <li>Month columns should represent the 15th of each month</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📊 Data Structure:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>All Sites (Trunking & Conventional):</strong> VSWR
                    and FPWR in pairs
                  </li>
                  <li>Each month has 2 columns: VSWR then FPWR</li>
                  <li>VSWR values must be between 1.0 and 3.0</li>
                  <li>
                    FPWR values must be between 0 and 200 (can be
                    empty/optional)
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⚠️ Important Notes:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Channel names must exist in the database</li>
                  <li>
                    Create sites and channels first before importing history
                  </li>
                  <li>
                    Duplicate entries (same channel + date) will be skipped
                  </li>
                  <li>Empty cells will be ignored</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">✅ Example Row:</h4>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  1 | Channel 001 | 1.2 | 45.5 | 1.3 | 46.0 | 1.1 | 44.8
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  (No | Channel | Jan VSWR | Jan FPWR | Feb VSWR | Feb FPWR |
                  ...)
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <Button onClick={() => setShowImportInstructions(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Import SWR Data from Excel</DialogTitle>
            <DialogDescription>
              Upload your Excel file with SWR history data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImportFile(file);
                  setImportResult(null);
                }}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <div className="text-gray-600 mb-2">
                  {importFile ? (
                    <span className="font-medium text-green-600">
                      {importFile.name}
                    </span>
                  ) : (
                    "Click to select Excel file (.xlsx, .xls)"
                  )}
                </div>
                <Button variant="secondary" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>

            {importResult && (
              <Alert
                variant={
                  importResult.failedRows > 0 ? "destructive" : "default"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Results</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2">
                    <p>✅ Successful: {importResult.successfulInserts}</p>
                    <p>❌ Failed: {importResult.failedRows}</p>
                    <p>📊 Total Processed: {importResult.totalRowsProcessed}</p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc pl-5 text-xs max-h-32 overflow-y-auto">
                          {importResult.errors
                            .slice(0, 10)
                            .map((err: string, idx: number) => (
                              <li key={idx}>{err}</li>
                            ))}
                          {importResult.errors.length > 10 && (
                            <li>
                              ... and {importResult.errors.length - 10} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-2">Quick Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Ensure all channels exist in the database before importing
                </li>
                <li>Use the correct date format (MMM-yy)</li>
                <li>VSWR values should be between 1.0 and 3.0</li>
                <li>Check the Import Guide for detailed instructions</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportResult(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? "Importing..." : "Upload & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
