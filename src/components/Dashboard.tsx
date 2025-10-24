import React from 'react';
import { 
  BarChart3, 
  Upload, 
  Download, 
  TrendingUp, 
  Users, 
  Phone, 
  PhoneOff,
  Calendar,
  Activity,
  Database,
  FileText,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Empty state - jujur bahwa belum ada data
  const hasData = false; // Ini nanti bisa dari props/state

  type QuickAction = {
    icon: React.ElementType;
    title: string;
    description: string;
    color: 'blue' | 'gray';
    path: string;
    isPrimary: boolean;
  };

  const quickActions: QuickAction[] = [
    {
      icon: Upload,
      title: "Upload Your First Data",
      description: "Start by importing your call records CSV file",
      color: "blue",
      path: "upload",
      isPrimary: true
    },
    {
      icon: FileText,
      title: "View Documentation",
      description: "Learn how to format your data files",
      color: "gray",
      path: "docs",
      isPrimary: false
    },
    {
      icon: HelpCircle,
      title: "Get Help",
      description: "Contact support for assistance",
      color: "gray", 
      path: "help",
      isPrimary: false
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Call Analytics",
      description: "Analyze call patterns, busy hours, and system performance metrics"
    },
    {
      icon: TrendingUp,
      title: "Performance Insights", 
      description: "Get detailed reports on call success rates and system utilization"
    },
    {
      icon: Download,
      title: "Export Reports",
      description: "Download comprehensive reports in CSV and Excel formats"
    }
  ];

  const systemStatus = [
    { 
      label: 'System Ready', 
      status: 'ready', 
      description: 'Waiting for data upload',
      icon: Shield
    },
    { 
      label: 'Database', 
      status: 'connected', 
      description: 'Connected and ready',
      icon: Database
    },
    { 
      label: 'Storage', 
      status: 'empty', 
      description: 'No data files uploaded',
      icon: Database
    }
  ];

  if (!hasData) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Welcome to Call Analytics</h1>
            <p className="text-blue-100 text-lg mb-6">
              Start analyzing your call data. Upload your first CSV file to unlock powerful insights and analytics.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Ready to process your data</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any call data yet. Start by uploading your first CSV file to see analytics and insights.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload First Data File
            </button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Get Started */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Get Started
            </h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                Prepare your call records in CSV format
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                Upload using the "Upload CSV" page
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                View analytics and generate reports
              </li>
            </ol>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              {systemStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'ready' ? 'bg-green-100 text-green-800' :
                    item.status === 'connected' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'ready' ? 'Ready' : 
                     item.status === 'connected' ? 'Connected' : 'Empty'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <feature.icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h2>
            <p className="text-gray-600">Choose your next step to begin analyzing call data</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Jika ada data, tampilkan dashboard normal
  return (
    <div>
      {/* Dashboard dengan data real akan ditampilkan di sini */}
      <div className="text-center py-12">
        <p className="text-gray-600">Data analytics will appear here once you upload your files.</p>
      </div>
    </div>
  );
};

// Component untuk Action Card
const ActionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'gray';
  path: string;
  isPrimary: boolean;
}> = ({ icon: Icon, title, description, color, path, isPrimary }) => {
  return (
    <button
      onClick={() => console.log('Navigate to:', path)}
      className={`w-full p-6 rounded-2xl text-left transition-all hover:shadow-md border-2 ${
        isPrimary 
          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
          : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300'
      } group`}
    >
      <div className={`p-3 rounded-xl w-12 h-12 mb-4 ${
        isPrimary 
          ? 'bg-white/20' 
          : 'bg-blue-100 text-blue-600'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className={`font-semibold mb-2 ${
        isPrimary ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      
      <p className={`text-sm mb-4 ${
        isPrimary ? 'text-blue-100' : 'text-gray-600'
      }`}>
        {description}
      </p>
      
      <div className={`flex items-center text-sm font-medium ${
        isPrimary ? 'text-white' : 'text-blue-600'
      }`}>
        <span>Get started</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default Dashboard;