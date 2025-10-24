import React from 'react';
import { 
  BarChart3, 
  Upload, 
  Download, 
  TrendingUp, 
  FileText,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Database,
  Shield
} from 'lucide-react';  

const Dashboard: React.FC = () => {
  const hasData = false;

  const quickActions = [
    {
      icon: Upload,
      title: "Upload Data CSV",
      description: "Mulai dengan mengupload file call records",
      color: "from-blue-500 to-cyan-500",
      path: "upload"
    },
    {
      icon: BarChart3,
      title: "Lihat Demo", 
      description: "Coba fitur dengan data sample",
      color: "from-purple-500 to-pink-500", 
      path: "demo"
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Analisis Trend", 
      description: "Lihat pola dan tren panggilan"
    },
    {
      icon: Download,
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

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-gray-600 mt-1">Selamat datang di panel analytics call records</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mulai Analisis Data</h2>
              <p className="text-gray-600">
                Upload data call records CSV Anda untuk melihat analytics dan insights.
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => console.log('Navigate to:', action.path)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
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
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            </div> */}

            {/* Help Card */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <HelpCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Butuh Bantuan?</h4>
              <p className="text-sm text-gray-600 mb-3">Lihat panduan penggunaan sistem</p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium text-sm border border-blue-200 hover:bg-blue-100 transition-colors">
                Buka Panduan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center py-12">
        <p className="text-gray-600">Data analytics akan muncul setelah upload file.</p>
      </div>
    </div>
  );
};

export default Dashboard;