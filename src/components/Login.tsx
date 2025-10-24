// components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login } = useAuth();

  // Clear messages when user starts typing
  useEffect(() => {
    if (username || password) {
      setError(null);
      setSuccess(null);
    }
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError('Harap lengkapi username dan password');
      return;
    }

    setIsLoading(true);

    try {
      // Call login via AuthContext
      await login({ 
        username: username.trim(), 
        password: password.trim() 
      });
      
      setSuccess('Login berhasil! Mengarahkan ke dashboard...');
      setUsername('');
      setPassword('');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error: any) {
      // Handle error from API
      let errorMessage = 'Username atau password tidak valid';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Shake animation for error feedback
      const form = document.getElementById('login-form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🔥 BACKGROUND DENGAN TECH ICONS - VERSION 3 🔥 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        
        {/* 🛰️ TECH ICONS FLOATING 🛰️ */}
        {[
          { icon: '📡', name: 'Antenna', color: 'text-blue-300' },
          { icon: '🛰️', name: 'Satellite', color: 'text-purple-300' },
          { icon: '📶', name: 'Signal', color: 'text-green-300' },
          { icon: '🖥️', name: 'Server', color: 'text-yellow-300' },
          { icon: '💻', name: 'Computer', color: 'text-red-300' },
          { icon: '🗄️', name: 'Database', color: 'text-indigo-300' },
          { icon: '🔗', name: 'Network', color: 'text-pink-300' },
          { icon: '📻', name: 'Radio', color: 'text-teal-300' },
          { icon: '🗼', name: 'Tower', color: 'text-orange-300' },
          { icon: '📱', name: 'Mobile', color: 'text-cyan-300' },
          { icon: '☁️', name: 'Cloud', color: 'text-gray-300' },
          { icon: '🌐', name: 'Internet', color: 'text-blue-400' },
          { icon: '📠', name: 'Fax', color: 'text-purple-400' },
          { icon: '💾', name: 'Storage', color: 'text-green-400' },
          { icon: '📹', name: 'Camera', color: 'text-yellow-400' },
          { icon: '🎛️', name: 'Control', color: 'text-red-400' }
        ].map((item, i) => (
          <div
            key={i}
            className={`absolute text-xl opacity-20 hover:opacity-40 transition-all duration-500 animate-float cursor-pointer ${item.color}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${20 + Math.random() * 30}s`,
              transform: `scale(${0.7 + Math.random() * 0.6}) rotate(${Math.random() * 360}deg)`,
              textShadow: '0 0 10px currentColor'
            }}
            title={item.name}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      {/* Main Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="glass-morphism-improved shadow-glow hover:shadow-glow-lg rounded-3xl p-8 sm:p-10 border border-white/20 transition-all duration-500 hover:border-white/30">
          
          {/* Enhanced Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-4 rounded-2xl shadow-2xl border border-white/20">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gradient-blue mb-3">
              Analytics Dashboard
            </h1>
            <p className="text-blue-100/70 text-sm font-light tracking-wide">
              Masuk untuk mengakses panel analytics terkini
            </p>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/15 border border-red-400/40 rounded-xl backdrop-blur-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-start space-x-3">
                <div className="bg-red-500/20 p-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-red-100 text-sm font-medium">{error}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="text-red-300 hover:text-red-100 transition-colors text-lg font-bold w-5 h-5 flex items-center justify-center hover:bg-red-500/20 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/15 border border-green-400/40 rounded-xl backdrop-blur-lg animate-in slide-in-from-top duration-300">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500/20 p-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-green-100 text-sm font-medium">{success}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="text-green-300 hover:text-green-100 transition-colors text-lg font-bold w-5 h-5 flex items-center justify-center hover:bg-green-500/20 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Login Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-medium text-blue-100 mb-3 group-focus-within:text-blue-300 transition-colors">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300/60 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 focus:bg-white/20 shadow-inner"
                  placeholder="Masukkan username Anda"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-sm font-medium text-blue-100 group-focus-within:text-blue-300 transition-colors">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-200/70 hover:text-blue-100 text-xs transition-colors font-medium hover:bg-white/10 px-2 py-1 rounded"
                  disabled={isLoading}
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300/60 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 focus:bg-white/20 shadow-inner"
                  placeholder="Masukkan password Anda"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-blue-200/70 hover:text-blue-100 transition-colors rounded-lg hover:bg-white/10"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-2xl hover:shadow-3xl relative overflow-hidden group"
            >
              {/* Animated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              {/* Button Content */}
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 relative z-10"></div>
                  <span className="relative z-10">Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10">Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Enhanced Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-blue-100/40 text-xs text-center font-light">
              © Jupri Eka Pratama
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;