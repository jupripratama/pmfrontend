// src/components/InspeksiKPCPage.tsx - COMPLETE WITH IMAGE PREVIEW
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { inspeksiApi, TemuanKPC, InspeksiQueryParams } from '../services/inspeksiApi';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit, Trash2, X, Check, AlertCircle, Download, 
  Filter, Search, Camera, Clock, CheckCircle, ChevronDown,
  FileText, MapPin, Calendar, User, Wrench, Image as ImageIcon,
  ClipboardList, Archive, RotateCcw, AlertTriangle, Eye, Trash
} from 'lucide-react';

export default function InspeksiKPCPage() {
  const { user } = useAuth();
  
  // State untuk data
  const [data, setData] = useState<TemuanKPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;
  
  // State untuk filter
  const [selectedRuang, setSelectedRuang] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk image gallery
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  // State untuk form
  const [form, setForm] = useState({
    ruang: '',
    temuan: '',
    kategoriTemuan: '',
    inspector: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    tanggalTemuan: format(new Date(), 'yyyy-MM-dd'),
    noFollowUp: '',
    picPelaksana: '',
    keterangan: '',
    // Update fields
    followUpRef: '',
    perbaikanDilakukan: '',
    tanggalPerbaikan: '',
    tanggalSelesaiPerbaikan: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Closed' | 'Rejected',
  });
  
  // State untuk upload foto dengan preview
  const [fotoTemuanFiles, setFotoTemuanFiles] = useState<File[]>([]);
  const [fotoHasilFiles, setFotoHasilFiles] = useState<File[]>([]);
  const [fotoTemuanPreviews, setFotoTemuanPreviews] = useState<string[]>([]);
  const [fotoHasilPreviews, setFotoHasilPreviews] = useState<string[]>([]);
  
  // State untuk existing photos (dari server)
  const [existingFotoTemuan, setExistingFotoTemuan] = useState<string[]>([]);
  const [existingFotoHasil, setExistingFotoHasil] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [currentPage, selectedRuang, selectedStatus, startDate, endDate, showHistory]);

  useEffect(() => {
    // Auto-dismiss notifications after 5 seconds
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: InspeksiQueryParams = {
        page: currentPage,
        pageSize,
        includeDeleted: showHistory,
      };
      
      if (selectedRuang) params.ruang = selectedRuang;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = showHistory 
        ? await inspeksiApi.getHistory(params)
        : await inspeksiApi.getAll(params);
      
      setData(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data di frontend untuk search
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.ruang.toLowerCase().includes(search) ||
      item.temuan.toLowerCase().includes(search) ||
      item.inspector?.toLowerCase().includes(search) ||
      item.picPelaksana?.toLowerCase().includes(search) ||
      item.keterangan?.toLowerCase().includes(search)
    );
  });

  // Get unique ruang for filter dropdown
  const ruangList = [...new Set(data.map(d => d.ruang))].sort();

  // ✅ Handle file selection with preview
  const handleFotoTemuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotoTemuanFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setFotoTemuanPreviews(previews);
  };

  const handleFotoHasilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotoHasilFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setFotoHasilPreviews(previews);
  };

  // ✅ Remove preview
  const removeFotoTemuanPreview = (index: number) => {
    const newFiles = fotoTemuanFiles.filter((_, i) => i !== index);
    const newPreviews = fotoTemuanPreviews.filter((_, i) => i !== index);
    setFotoTemuanFiles(newFiles);
    setFotoTemuanPreviews(newPreviews);
  };

  const removeFotoHasilPreview = (index: number) => {
    const newFiles = fotoHasilFiles.filter((_, i) => i !== index);
    const newPreviews = fotoHasilPreviews.filter((_, i) => i !== index);
    setFotoHasilFiles(newFiles);
    setFotoHasilPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (isEditMode && editingId) {
        // Update mode
        await inspeksiApi.update(editingId, {
          followUpRef: form.followUpRef || undefined,
          perbaikanDilakukan: form.perbaikanDilakukan || undefined,
          tanggalPerbaikan: form.tanggalPerbaikan || undefined,
          tanggalSelesaiPerbaikan: form.tanggalSelesaiPerbaikan || undefined,
          picPelaksana: form.picPelaksana || undefined,
          status: form.status,
          keterangan: form.keterangan || undefined,
          fotoHasilFiles: fotoHasilFiles.length > 0 ? fotoHasilFiles : undefined,
        });
        setSuccess('Temuan berhasil diperbarui');
      } else {
        // Create mode
        const result = await inspeksiApi.create({
          ruang: form.ruang,
          temuan: form.temuan,
          kategoriTemuan: form.kategoriTemuan || undefined,
          inspector: form.inspector || undefined,
          severity: form.severity,
          tanggalTemuan: form.tanggalTemuan,
          noFollowUp: form.noFollowUp || undefined,
          picPelaksana: form.picPelaksana || undefined,
          keterangan: form.keterangan || undefined,
          fotoTemuanFiles: fotoTemuanFiles.length > 0 ? fotoTemuanFiles : undefined,
        });
        setSuccess(result.message || 'Temuan berhasil dibuat');
      }
      
      closeModal();
      loadData();
      
    } catch (err: any) {
      console.error('Error submitting:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin memindahkan temuan ini ke history?')) return;
    
    try {
      setError('');
      const result = await inspeksiApi.delete(id);
      setSuccess(result.message || 'Temuan dipindahkan ke history');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm('Yakin ingin mengembalikan temuan ini?')) return;
    
    try {
      setError('');
      const result = await inspeksiApi.restore(id);
      setSuccess(result.message || 'Temuan berhasil dikembalikan');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengembalikan data');
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setForm({
      ruang: '',
      temuan: '',
      kategoriTemuan: '',
      inspector: '',
      severity: 'Medium',
      tanggalTemuan: format(new Date(), 'yyyy-MM-dd'),
      noFollowUp: '',
      picPelaksana: '',
      keterangan: '',
      followUpRef: '',
      perbaikanDilakukan: '',
      tanggalPerbaikan: '',
      tanggalSelesaiPerbaikan: '',
      status: 'Open',
    });
    setFotoTemuanFiles([]);
    setFotoHasilFiles([]);
    setFotoTemuanPreviews([]);
    setFotoHasilPreviews([]);
    setExistingFotoTemuan([]);
    setExistingFotoHasil([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    try {
      setLoading(true);
      const item = await inspeksiApi.getById(id);
      
      setIsEditMode(true);
      setEditingId(id);
      setForm({
        ruang: item.ruang,
        temuan: item.temuan,
        kategoriTemuan: item.kategoriTemuan || '',
        inspector: item.inspector || '',
        severity: item.severity,
        tanggalTemuan: item.tanggalTemuan,
        noFollowUp: item.noFollowUp || '',
        picPelaksana: item.picPelaksana || '',
        keterangan: item.keterangan || '',
        followUpRef: item.followUpRef || '',
        perbaikanDilakukan: item.perbaikanDilakukan || '',
        tanggalPerbaikan: item.tanggalPerbaikan || '',
        tanggalSelesaiPerbaikan: item.tanggalSelesaiPerbaikan || '',
        status: item.status,
      });
      
      // Set existing photos
      setExistingFotoTemuan(item.fotoTemuanUrls || []);
      setExistingFotoHasil(item.fotoHasilUrls || []);
      
      setFotoTemuanFiles([]);
      setFotoHasilFiles([]);
      setFotoTemuanPreviews([]);
      setFotoHasilPreviews([]);
      setIsModalOpen(true);
      
    } catch (err: any) {
      setError('Gagal memuat detail temuan');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setFotoTemuanFiles([]);
    setFotoHasilFiles([]);
    setFotoTemuanPreviews([]);
    setFotoHasilPreviews([]);
    setExistingFotoTemuan([]);
    setExistingFotoHasil([]);
    
    // Cleanup preview URLs
    fotoTemuanPreviews.forEach(url => URL.revokeObjectURL(url));
    fotoHasilPreviews.forEach(url => URL.revokeObjectURL(url));
  };

  const handleExport = async () => {
    try {
      await inspeksiApi.exportToExcel({
        history: showHistory,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ruang: selectedRuang || undefined,
        status: selectedStatus || undefined,
      });
      setSuccess('Export berhasil');
    } catch (err: any) {
      setError('Gagal export data');
    }
  };

  const clearFilters = () => {
    setSelectedRuang('');
    setSelectedStatus('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // ✅ Open image gallery
  const openImageGallery = (images: string[], startIndex: number = 0) => {
    setViewingImages(images);
    setCurrentImageIndex(startIndex);
    setShowImageGallery(true);
  };

  const closeImageGallery = () => {
    setShowImageGallery(false);
    setViewingImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % viewingImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + viewingImages.length) % viewingImages.length);
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-blue-600" />
          Inspeksi KPC {showHistory && '- History'}
        </h1>
        <p className="text-gray-600 mt-1">
          {showHistory ? 'Data temuan yang sudah dihapus' : 'Kelola temuan inspeksi per ruang'}
        </p>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Actions */}
      <div className="mb-6 space-y-4">
        {/* Row 1: Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruang</label>
            <select
              value={selectedRuang}
              onChange={(e) => { setSelectedRuang(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Ruang</option>
              {ruangList.map(ruang => (
                <option key={ruang} value={ruang}>{ruang}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Row 2: Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          
          <button
            onClick={() => { setShowHistory(!showHistory); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showHistory 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {showHistory ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {showHistory ? 'Lihat Data Aktif' : 'Lihat History'}
          </button>
          
          {(selectedRuang || selectedStatus || startDate || endDate || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
          
          {!showHistory && (
            <button
              onClick={openCreateModal}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Temuan
            </button>
          )}
          
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{totalCount}</span> temuan
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Ruang</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Inspector</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Temuan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Tgl Temuan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Foto Temuan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Perbaikan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Tgl Selesai</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Foto Hasil</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Dibuat</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                    {showHistory ? 'Tidak ada data di history' : 'Belum ada data temuan'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(currentPage - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">{item.ruang}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.inspector || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{item.temuan}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        item.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.tanggalTemuan ? format(new Date(item.tanggalTemuan), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.fotoTemuanUrls && item.fotoTemuanUrls.length > 0 ? (
                        <button
                          onClick={() => openImageGallery(item.fotoTemuanUrls || [])}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {item.fotoTemuan}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{item.perbaikanDilakukan || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.tanggalSelesaiPerbaikan ? format(new Date(item.tanggalSelesaiPerbaikan), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.fotoHasilUrls && item.fotoHasilUrls.length > 0 ? (
                        <button
                          onClick={() => openImageGallery(item.fotoHasilUrls || [])}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {item.fotoHasil}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Closed' ? 'bg-green-100 text-green-800' :
                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{item.createdByName}</div>
                      <div className="text-xs text-gray-500">{item.createdAt}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        {showHistory ? (
                          <button
                            onClick={() => item.id && handleRestore(item.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => item.id && openEditModal(item.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => item.id && handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

     {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isEditMode ? 'Update Temuan' : 'Tambah Temuan Baru'}
                </h2>
                <button onClick={closeModal} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {!isEditMode ? (
                  // ✅ CREATE MODE
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          Ruang <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.ruang}
                          onChange={(e) => setForm({ ...form, ruang: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Contoh: Ruang Server A"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Inspector
                        </label>
                        <input
                          type="text"
                          value={form.inspector}
                          onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nama inspector"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Severity <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={form.severity}
                          onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Temuan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={form.temuan}
                        onChange={(e) => setForm({ ...form, temuan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Jelaskan temuan secara detail..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Temuan</label>
                        <input
                          type="text"
                          value={form.kategoriTemuan}
                          onChange={(e) => setForm({ ...form, kategoriTemuan: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Contoh: Kebersihan, Keamanan, dll"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4" />
                          Tanggal Temuan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={form.tanggalTemuan}
                          onChange={(e) => setForm({ ...form, tanggalTemuan: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">No Follow Up</label>
                        <input
                          type="text"
                          value={form.noFollowUp}
                          onChange={(e) => setForm({ ...form, noFollowUp: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="WR-2025-001 atau Email"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          PIC Pelaksana
                        </label>
                        <input
                          type="text"
                          value={form.picPelaksana}
                          onChange={(e) => setForm({ ...form, picPelaksana: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Nama PIC atau Email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                      <textarea
                        rows={2}
                        value={form.keterangan}
                        onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg resize-none"
                        placeholder="Catatan tambahan..."
                      />
                    </div>

                    {/* ✅ FOTO TEMUAN UPLOAD WITH PREVIEW */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Camera className="w-4 h-4 text-blue-600" />
                        Foto Temuan (Multiple)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFotoTemuanChange}
                        className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      
                      {/* Preview Grid */}
                      {fotoTemuanPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-3">
                          {fotoTemuanPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeFotoTemuanPreview(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {fotoTemuanFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          📸 {fotoTemuanFiles.length} foto dipilih
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // ✅ EDIT MODE
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Informasi Temuan (Read-only)
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Ruang:</span> 
                          <span className="font-semibold ml-2">{form.ruang}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Inspector:</span> 
                          <span className="font-semibold ml-2">{form.inspector || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Severity:</span> 
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            form.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            form.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                            form.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {form.severity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tanggal:</span> 
                          <span className="ml-2">{format(new Date(form.tanggalTemuan), 'dd MMM yyyy')}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Temuan:</span> 
                          <p className="mt-1 text-gray-800">{form.temuan}</p>
                        </div>
                      </div>
                      
                      {/* Show existing foto temuan */}
                      {existingFotoTemuan.length > 0 && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Foto Temuan:</label>
                          <div className="grid grid-cols-4 gap-2">
                            {existingFotoTemuan.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Temuan ${index + 1}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                                onClick={() => openImageGallery(existingFotoTemuan, index)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Follow Up Ref</label>
                      <input
                        type="text"
                        value={form.followUpRef}
                        onChange={(e) => setForm({ ...form, followUpRef: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Referensi follow up (email/nomor WR)"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Wrench className="w-4 h-4" />
                        Perbaikan yang Dilakukan
                      </label>
                      <textarea
                        rows={3}
                        value={form.perbaikanDilakukan}
                        onChange={(e) => setForm({ ...form, perbaikanDilakukan: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg resize-none"
                        placeholder="Deskripsikan perbaikan yang telah dilakukan..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4" />
                          Tanggal Perbaikan
                        </label>
                        <input
                          type="date"
                          value={form.tanggalPerbaikan}
                          onChange={(e) => setForm({ ...form, tanggalPerbaikan: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Tanggal Selesai
                        </label>
                        <input
                          type="date"
                          value={form.tanggalSelesaiPerbaikan}
                          onChange={(e) => setForm({ ...form, tanggalSelesaiPerbaikan: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        PIC Pelaksana
                      </label>
                      <input
                        type="text"
                        value={form.picPelaksana}
                        onChange={(e) => setForm({ ...form, picPelaksana: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Nama PIC atau Email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan Update</label>
                      <textarea
                        rows={2}
                        value={form.keterangan}
                        onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg resize-none"
                        placeholder="Catatan tambahan tentang update..."
                      />
                    </div>

                    {/* ✅ FOTO HASIL UPLOAD WITH PREVIEW */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Camera className="w-4 h-4 text-green-600" />
                        Foto Hasil Perbaikan (Multiple)
                      </label>
                      
                      {/* Show existing photos */}
                      {existingFotoHasil.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-2">Foto yang sudah ada:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {existingFotoHasil.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Hasil ${index + 1}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                                onClick={() => openImageGallery(existingFotoHasil, index)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFotoHasilChange}
                        className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      
                      {/* Preview NEW uploads */}
                      {fotoHasilPreviews.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Foto baru yang akan diupload:</p>
                          <div className="grid grid-cols-4 gap-3">
                            {fotoHasilPreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border-2 border-green-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFotoHasilPreview(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                  New {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {fotoHasilFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          📸 {fotoHasilFiles.length} foto baru akan ditambahkan
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {isEditMode ? 'Memperbarui...' : 'Menyimpan...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {isEditMode ? 'Update' : 'Simpan'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✅ IMAGE GALLERY MODAL */}
      <AnimatePresence>
        {showImageGallery && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={closeImageGallery}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeImageGallery}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2"
              >
                <X className="w-6 h-6" />
                <span>Close (ESC)</span>
              </button>

              {/* Image counter */}
              <div className="absolute -top-12 left-0 text-white text-sm">
                {currentImageIndex + 1} / {viewingImages.length}
              </div>

              {/* Main image */}
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={viewingImages[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>

              {/* Navigation */}
              {viewingImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                  >
                    <ChevronDown className="w-6 h-6 rotate-90" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                  >
                    <ChevronDown className="w-6 h-6 -rotate-90" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {viewingImages.length > 1 && (
                <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
                  {viewingImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard navigation for gallery */}
      {showImageGallery && (
        <div className="hidden">
          {/* eslint-disable-next-line */}
          <div
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeImageGallery();
              if (e.key === 'ArrowLeft') prevImage();
              if (e.key === 'ArrowRight') nextImage();
            }}
            tabIndex={0}
            ref={(el) => el?.focus()}
          />
        </div>
      )}
    </div>
  );
}
   