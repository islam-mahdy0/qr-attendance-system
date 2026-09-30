'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Users, Calendar, LogOut, Search } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function FacultyPage() {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyInfo, setFacultyInfo] = useState<any>(null);

  useEffect(() => {
    const facultyAuth = localStorage.getItem('facultyAuthenticated');
    const currentFaculty = localStorage.getItem('currentFaculty');

    if (!facultyAuth || !currentFaculty) {
      router.push('/');
      return;
    }

    const parsedFaculty = JSON.parse(currentFaculty);
    setFacultyInfo(parsedFaculty);

    const fetchAttendance = async () => {
      try {
        // بنجيب سجلات الحضور الخاصة بالدكتور ده بس
        const q = query(
          collection(db, 'attendance'),
          where('facultyId', '==', parsedFaculty.id)
        );
        const querySnapshot = await getDocs(q);
        const records = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttendanceRecords(records);
      } catch (error) {
        console.error("Error fetching attendance: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('facultyAuthenticated');
    localStorage.removeItem('currentFaculty');
    router.push('/');
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentRoll?.includes(searchTerm)
  );

  const presentToday = filteredRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-600 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">Faculty Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {facultyInfo?.fullName || 'Faculty'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-gray-900">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Student Attendance</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
              <button 
                onClick={() => router.push('/qr_display')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <QrCode className="h-4 w-4" />
                Display QR
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading attendance records...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No attendance records found for your courses.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">STUDENT</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">ROLL NUMBER</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">DATE</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">TIME</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{record.studentName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.studentRoll}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(record.time).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}