'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, UserCheck, GraduationCap, Shield } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import StudentRegistration from './components/StudentRegistration';
import FacultyRegistration from './components/FacultyRegistration';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [showRegistration, setShowRegistration] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  if (showRegistration) {
    return userType === 'student' ? (
      <StudentRegistration 
        onBack={() => setShowRegistration(false)}
        onRegisterSuccess={() => setShowRegistration(false)}
      />
    ) : (
      <FacultyRegistration 
        onBack={() => setShowRegistration(false)}
        onRegisterSuccess={() => setShowRegistration(false)}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 1. لوحة تحكم الأدمن (تجريبي)
    if (userType === 'faculty' && credentials.username === 'admin@aimscs' && credentials.password === 'admin123') {
      localStorage.setItem('adminAuthenticated', 'true');
      setIsLoading(false);
      router.push('/admin_page');
      return;
    }

    // 2. دكتور - بنقرا من Firebase
    if (userType === 'faculty') {
      try {
        const q = query(
          collection(db, "faculty"),
          where("facultyId", "==", credentials.username),
          where("password", "==", credentials.password)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const facultyDoc = querySnapshot.docs[0];
          const facultyData = { id: facultyDoc.id, ...facultyDoc.data() };
          
          localStorage.setItem('facultyAuthenticated', 'true');
          localStorage.setItem('currentFaculty', JSON.stringify(facultyData));
          setIsLoading(false);
          router.push('/faculty_page');
          return;
        } else {
          alert('Invalid Faculty ID or password! Please check your credentials or register first.');
        }
      } catch (error) {
        console.error("Login error: ", error);
        alert('Login error. Please try again.');
      }
    }

    // 3. طالب - بنقرا من Firebase
    if (userType === 'student') {
      try {
        const q = query(
          collection(db, "students"),
          where("rollNumber", "==", credentials.username),
          where("password", "==", credentials.password)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const studentData = { id: studentDoc.id, ...studentDoc.data() };
          
          localStorage.setItem('studentAuthenticated', 'true');
          localStorage.setItem('currentStudent', JSON.stringify(studentData));
          setIsLoading(false);
          router.push('/student_page');
          return;
        } else {
          alert('Invalid roll number or password! Please check your credentials or register first.');
        }
      } catch (error) {
        console.error("Login error: ", error);
        alert('Login error. Please try again.');
      }
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <QrCode className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Attendance</h1>
          <p className="text-gray-600">Secure & Modern Attendance Management</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setUserType('student'); setShowRegistration(false); }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'student' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2" /> Student
            </button>
            <button
              type="button"
              onClick={() => { setUserType('faculty'); setShowRegistration(false); }}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'faculty' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="h-4 w-4 mr-2" /> Faculty
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'student' ? 'Roll Number' : 'Faculty ID'}
              </label>
              <input
                type="text"
                required
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder={userType === 'student' ? 'Enter your roll number' : 'Enter your faculty ID'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Signing In...</>
              ) : (
                <><UserCheck className="h-5 w-5 mr-2" />Sign In as {userType}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mt-2">
              Don't have an account?{' '}
              <button 
                onClick={() => setShowRegistration(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {userType === 'student' ? 'Register as Student' : 'Register as Faculty'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Your login is secured with encryption. QR codes are dynamic and expire automatically for security.
          </p>
        </div>
      </div>
    </div>
  );
}