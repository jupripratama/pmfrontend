// Buat component ErrorDebug.tsx
import React from 'react';

interface ErrorDebugProps {
  data: any;
  title: string;
}

const ErrorDebug: React.FC<ErrorDebugProps> = ({ data, title }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-yellow-800 mb-2">{title} - Debug Info:</h4>
      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ErrorDebug;