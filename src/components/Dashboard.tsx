import React from 'react';
import { BarChart3, Upload, Download, TrendingUp, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 xl:p-8 text-center">
        <BarChart3 className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600 mx-auto mb-3 lg:mb-4" />
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
          Welcome to Call Analytics
        </h1>
        <p className="text-gray-600 text-sm lg:text-base mb-4 lg:mb-6 max-w-4xl mx-auto px-2">
          Manage and analyze your call records data efficiently. Upload CSV files, 
          view detailed call statistics, and export reports with ease.
        </p>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 xl:gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Upload,
              title: "Upload Data",
              description: "Import your call records CSV files to start analyzing data",
              color: "blue"
            },
            {
              icon: TrendingUp,
              title: "View Analytics",
              description: "Analyze call patterns, busy hours, and system performance",
              color: "green"
            },
            {
              icon: Download,
              title: "Export Reports",
              description: "Download detailed reports in CSV and Excel formats",
              color: "purple"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-xl p-4 lg:p-6 border border-${feature.color}-200 hover:shadow-md transition-shadow`}
            >
              <feature.icon className={`w-8 h-8 lg:w-10 lg:h-10 text-${feature.color}-600 mx-auto mb-3`} />
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-xs lg:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { icon: Users, label: "Total Calls Today", value: "-", color: "blue" },
          { icon: BarChart3, label: "Successful Calls", value: "-", color: "green" },
          { icon: TrendingUp, label: "Busy Rate", value: "-", color: "yellow" },
          { icon: Download, label: "Files Processed", value: "-", color: "purple" }
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-2 lg:p-3 rounded-xl bg-${stat.color}-500 text-white mr-3`}>
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
                  {stat.label}
                </p>
                <p className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;