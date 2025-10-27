import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { UploadCsvResponse } from '../types/callRecord';
import { useNavigate } from 'react-router-dom'; 

interface UploadPageProps {
  onBack: () => void;
  setActiveTab?: (tab: string) => void; // Tambahkan ini
}

const UploadPage: React.FC<UploadPageProps> = ({ onBack, setActiveTab }) => {
  const navigate = useNavigate(); 
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadCsvResponse | null>(null);

  const handleBack = () => {
    // ✅ PASTIKAN onBack DIPANGGIL
    if (onBack) {
      onBack();
    }
    // ✅ DAN PAKAI navigate UNTUK ROUTING
    navigate('/callrecords');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setSelectedFile(file);
    setUploadResult(null);
    
    try {
      const response = await callRecordApi.importCsv(file);
      setUploadResult(response);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex-1">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4 flex-1">
     <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
      </button>
      
      {/* Container untuk teks yang akan di-tengah */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-2xl font-bold text-gray-900">Upload CSV File</h1>
              <p className="text-gray-600 mt-1">Import call records data from CSV file</p>
      </div>
      
      {/* Elemen kosong untuk menjaga keseimbangan flexbox */}
      <div className="w-9"></div>
    </div>
  </div>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
            } ${isUploading ? 'opacity-50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isUploading && document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Uploading...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Processing {selectedFile?.name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Upload CSV File
                </p>
                <p className="text-gray-500 mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select File
                </button>
              </div>
            )}
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className={`mt-6 p-6 rounded-lg border ${
              uploadResult.successfulRecords > 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                uploadResult.successfulRecords > 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadResult.successfulRecords > 0 ? 'Upload Successful!' : 'Upload Completed with Issues'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className={`p-3 rounded ${
                  uploadResult.successfulRecords > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="font-semibold">Successful Records</div>
                  <div className="text-2xl font-bold">{uploadResult.successfulRecords.toLocaleString()}</div>
                </div>
                
                {uploadResult.failedRecords > 0 && (
                  <div className="bg-red-100 text-red-800 p-3 rounded">
                    <div className="font-semibold">Failed Records</div>
                    <div className="text-2xl font-bold">{uploadResult.failedRecords.toLocaleString()}</div>
                  </div>
                )}
                
                <div className="bg-blue-100 text-blue-800 p-3 rounded">
                  <div className="font-semibold">Total Processed</div>
                  <div className="text-2xl font-bold">{uploadResult.totalRecords.toLocaleString()}</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                  <div className="bg-red-100 rounded p-3 max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-red-700 text-sm py-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Requirements */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            File Requirements
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>CSV format with comma separator</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>First column: Date (YYYYMMDD)</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Second column: Time (HH:mm:ss)</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Close reason in second last column</span>
            </div>
            <div className="flex items-center text-red-600">
              <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Maximum file size: 100MB</span>
            </div>
            <div className="flex items-center text-amber-600">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>File will be validated during upload</span>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && !isUploading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;