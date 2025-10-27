import React, { useState } from 'react';
import { Upload, Loader2, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { callRecordApi } from '../services/api';
import { UploadCsvResponse } from '../types/callRecord';

interface FileUploadProps {
  onUploadComplete: (response: UploadCsvResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setSelectedFile(file);
    
    try {
      const response = await callRecordApi.importCsv(file);
      onUploadComplete(response);
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
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
            <Loader2 className="w-16 h-16 mb-4 animate-spin text-blue-500" />
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

      {/* File Requirements */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          File Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
  );
};

export default FileUpload;