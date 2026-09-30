'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function FacultyRegistration({ onBack, onRegisterSuccess }: any) {
  const [formData, setFormData] = useState({
    fullName: '',
    facultyId: '',
    department: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // نتأكد إن الـ Faculty ID مش متسجل قبل كده
      const q = query(
        collection(db, "faculty"),
        where("facultyId", "==", formData.facultyId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus('error');
        setMessage('This Faculty ID is already registered.');
        setIsLoading(false);
        return;
      }

      // نسجل الدكتور في Firebase
      await addDoc(collection(db, "faculty"), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setMessage('Registration successful! You can now login.');
      
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);

    } catch (error) {
      console.error("Error registering faculty: ", error);
      setStatus('error');
      setMessage('Error registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Login
          </button>

          <div className="text-center mb-6">
            <div className="bg-green-600 p-3 rounded-full inline-block mb-3">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Faculty Registration</h2>
            <p className="text-gray-500">Create your account to manage attendance</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-900">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="e.g., Dr. Ahmed Mohamed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                <input
                  type="text"
                  required
                  value={formData.facultyId}
                  onChange={(e) => handleChange('facultyId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="e.g., doctor.ahmed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter a password"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${status === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Registering...' : 'Register as Faculty'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}