'use client';

import { useState } from 'react';
import { QrCode, UserCheck, GraduationCap, Shield } from 'lucide-react';

export default function LoginPage() {
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Login attempt:', { userType, credentials });
    setIsLoading(false);
    
    // TODO: Implement actual authentication logic
    alert(`${userType} login successful! (This is a demo)`);
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <QrCode className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Attendance
          </h1>
          <p className="text-gray-600">
            Secure & Modern Attendance Management
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* User Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                userType === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('faculty')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                userType === 'faculty'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Faculty
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {userType === 'student' ? 'Roll Number' : 'Faculty ID'}
              </label>
              <input
                id="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder={
                  userType === 'student' 
                    ? 'Enter your roll number' 
                    : 'Enter your faculty ID'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5 mr-2" />
                  Sign In as {userType}
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Forgot your password?{' '}
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Reset here
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Your login is secured with encryption. QR codes are dynamic and expire automatically for security.
          </p>
        </div>
      </div>
    </div>
  );
}
