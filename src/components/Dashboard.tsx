import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Upload, 
  TrendingUp, 
  FileText,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Database,
  Shield,
  AlertTriangle
} from 'lucide-react';  

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const hasData = false;
  const { user } = useAuth();
  
  // Cek role user
  const isAdmin = user?.roleId === 1 || user?.roleId === 2;
  const isRegularUser = !isAdmin;

  const handleActionClick = (tab: string) => {
  console.log('🔄 Switching to tab:', tab);
  setActiveTab(tab);
  // Navigate menggunakan window.location untuk sementara
  window.location.href = `/${tab}`;
};

  // Quick Actions HANYA untuk Admin
  const adminActions = [
    {
      icon: Upload,
      title: "Upload Data CSV",
      description: "Upload file call records untuk analisis",
      color: "from-blue-500 to-cyan-500",
      tab: "upload"
    },
    {
      icon: BarChart3,
      title: "View Call Records", 
      description: "Lihat dan analisis data call records",
      color: "from-purple-500 to-pink-500", 
      tab: "callrecords"
    }
  ];

  // Quick Actions HANYA untuk User Biasa
  const userActions = [
    {
      icon: BarChart3,
      title: "Lihat Demo Analytics", 
      description: "Explore analytics dengan data sample",
      color: "from-purple-500 to-pink-500", 
      tab: "callrecords"
    },
    {
      icon: FileText,
      title: "Panduan Format Data",
      description: "Pelajari struktur data yang didukung",
      color: "from-green-500 to-emerald-500",
      tab: "docs"
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Analisis Trend", 
      description: "Lihat pola dan tren panggilan"
    },
    {
      icon: FileText,
      title: "Export Laporan",
      description: "Download report dalam format Excel/CSV"
    },
    {
      icon: Shield,
      title: "Data Aman",
      description: "Data Anda tersimpan dengan aman"
    }
  ];

  const systemStatus = [
    { 
      label: 'Status Sistem', 
      status: 'ready', 
      icon: CheckCircle
    },
    { 
      label: 'Database', 
      status: 'connected', 
      icon: Database
    }
  ];

  // Gunakan actions berdasarkan role
  const currentActions = isAdmin ? adminActions : userActions;
  const actionTitle = isAdmin ? 'Aksi Admin' : 'Mulai Explorasi';

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {user?.fullName} 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isAdmin ? 'Kelola Data Call Records' : 'Analytics Call Records'}
              </h2>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'Upload dan kelola data call records untuk analisis mendalam.'
                  : 'Lihat analytics dan insights dari data call records.'
                }
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Admin Notice untuk User Biasa */}
        {isRegularUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Akses Terbatas</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Anda login sebagai User. Fitur upload CSV hanya tersedia untuk Admin.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action.tab)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group w-full"
                  >
                    <div className={`p-2 rounded-lg w-10 h-10 mb-3 bg-gradient-to-r ${action.color}`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>Mulai</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitur Utama</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h3>
              <div className="space-y-3">
                {systemStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status === 'ready' ? 'Ready' : 'Connected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <HelpCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Butuh Bantuan?</h4>
              <p className="text-sm text-gray-600 mb-3">
                {isAdmin 
                  ? 'Panduan upload dan manajemen data'
                  : 'Panduan melihat analytics dan reports'
                }
              </p>
              <button 
                onClick={() => setActiveTab('docs')}
                className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                Buka Panduan
              </button>
            </div>

            {/* Info Role */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Info Akses</h4>
              <p className="text-xs text-gray-600">
                {isAdmin 
                  ? 'Anda memiliki akses penuh: Upload, Delete, dan Export data.'
                  : 'Anda dapat melihat analytics dan reports dari data yang tersedia.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika ada data (future implementation)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Data analytics akan muncul setelah upload file.</p>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);