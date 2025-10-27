import React from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Table,
  Settings,
  Clock,
  Phone,
  User,
  Calendar
} from 'lucide-react';

interface DocsProps {
  setActiveTab?: (tab: string) => void;
}

const DocsPage: React.FC<DocsProps> = ({ setActiveTab }) => {
  const handleBack = () => {
    if (setActiveTab) {
      setActiveTab('dashboard');
    } else {
      window.history.back();
    }
  };

  // Contoh data CSV
  const csvExample = `callRecordId,calldate,callTime,callCloseReason,hourGroup
1,2024-01-15,08:30:25,0,8
2,2024-01-15,09:15:42,1,9
3,2024-01-15,10:05:18,4,10
4,2024-01-15,11:20:33,2,11
5,2024-01-15,14:45:12,0,14`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panduan Format Data</h1>
              <p className="text-gray-600">Struktur file CSV untuk import call records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Isi</h3>
            <nav className="space-y-2">
              <a href="#format-umum" className="block py-2 px-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
                📋 Format Umum
              </a>
              <a href="#struktur-kolom" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                🗂️ Struktur Kolom
              </a>
              <a href="#kode-alasan" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                📞 Kode Alasan Panggilan
              </a>
              <a href="#contoh-file" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                📄 Contoh File
              </a>
              <a href="#tips-upload" className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                💡 Tips Upload
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Format Umum Section */}
          <section id="format-umum" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Table className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Format Umum File CSV</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Format yang Didukung</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      File CSV dengan encoding UTF-8, pemisah koma, dan header kolom
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ukuran File</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Maksimal 10MB per file. Support hingga 100,000 records
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Format Tanggal & Waktu</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      YYYY-MM-DD untuk tanggal, HH:MM:SS untuk waktu
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Yang Harus Dihindari</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Karakter khusus, format tanggal lokal, file terproteksi
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Format Tidak Support</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      File Excel (.xlsx), PDF, atau format binary lainnya
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Penting</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Backup data sebelum upload. Proses tidak bisa dibatalkan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Struktur Kolom Section */}
          <section id="struktur-kolom" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Struktur Kolom Wajib</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kolom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wajib
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contoh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      callRecordId
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Integer</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">1, 2, 3</td>
                    <td className="px-4 py-3 text-sm text-gray-600">ID unik record panggilan</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      calldate
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Date (YYYY-MM-DD)</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">2024-01-15</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Tanggal panggilan terjadi</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      callTime
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Time (HH:MM:SS)</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">14:30:25</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Waktu panggilan terjadi</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      callCloseReason
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Integer (0-10)</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">0, 1, 4</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Kode alasan penutupan panggilan</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      hourGroup
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">Integer (0-23)</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ya
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">8, 14, 22</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Grup jam untuk analisis (0-23)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Kode Alasan Section */}
          <section id="kode-alasan" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Kode Alasan Penutupan Panggilan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { code: 0, title: 'TE Busy', description: 'Perangkat tujuan sedang sibuk' },
                { code: 1, title: 'System Busy', description: 'Sistem sedang overload' },
                { code: 2, title: 'No Answer', description: 'Tidak ada jawaban' },
                { code: 3, title: 'Not Found', description: 'Nomor tidak ditemukan' },
                { code: 4, title: 'Complete', description: 'Panggilan berhasil' },
                { code: 5, title: 'Preempted', description: 'Panggilan dihentikan untuk prioritas' },
                { code: 6, title: 'Timeout', description: 'Panggilan timeout' },
                { code: 7, title: 'Inactive', description: 'Perangkat tidak aktif' },
                { code: 8, title: 'Callback', description: 'Masuk antrian callback' },
                { code: 9, title: 'Unsupported', description: 'Request tidak didukung' },
                { code: 10, title: 'Invalid Call', description: 'Panggilan tidak valid' }
              ].map((reason) => (
                <div key={reason.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Kode: {reason.code}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      reason.code === 4 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reason.code === 4 ? 'Success' : 'Not Connected'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{reason.title}</h4>
                  <p className="text-xs text-gray-600">{reason.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contoh File Section */}
          <section id="contoh-file" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Contoh File CSV</h2>
              </div>
              <button
                onClick={() => {
                  // Create and download sample CSV
                  const blob = new Blob([csvExample], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'contoh_format_call_records.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Contoh</span>
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                {csvExample}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Tips Formatting</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pastikan header kolom sesuai dengan contoh di atas</li>
                    <li>• Gunakan format tanggal YYYY-MM-DD (tahun-bulan-tanggal)</li>
                    <li>• Gunakan format waktu 24 jam (HH:MM:SS)</li>
                    <li>• Tidak ada spasi ekstra atau karakter khusus</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Tips Upload Section */}
          <section id="tips-upload" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Tips & Best Practices</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Sebelum Upload
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Validasi data di file CSV sebelum upload
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Pastikan tidak ada data duplikat
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Cek konsistensi format tanggal dan waktu
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Backup data original
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                  Troubleshooting
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">ℹ</span>
                    File gagal upload? Cek encoding UTF-8
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">ℹ</span>
                    Data tidak muncul? Validasi format kolom
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">ℹ</span>
                    Error parsing? Pastikan tidak ada karakter khusus
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">ℹ</span>
                    Butuh bantuan? Hubungi tim support
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;