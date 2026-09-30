'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Calendar, CheckCircle, Clock, LogOut } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function StudentPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentAuth = localStorage.getItem('studentAuthenticated');
    const currentStudent = localStorage.getItem('currentStudent');

    if (!studentAuth || !currentStudent) {
      router.push('/');
      return;
    }

    const parsedStudent = JSON.parse(currentStudent);
    setStudent(parsedStudent);

    const fetchAttendance = async () => {
      try {
        const q = query(
          collection(db, 'attendance'),
          where('studentId', '==', parsedStudent.id)
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
    localStorage.removeItem('studentAuthenticated');
    localStorage.removeItem('currentStudent');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading student data...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No student data found. Please login again.</p>
      </div>
    );
  }

  const presentCount = attendanceRecords.filter((r: any) => r.status === 'present').length;
  const attendancePercentage = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {student.fullName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-gray-900">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.fullName}</h2>
              <div className="space-y-1 text-gray-600">
                <p>Roll Number: {student.rollNumber}</p>
                <p>Course: {student.course}</p>
                <p>Year: {student.year}</p>
                <p>Department: {student.department}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Your QR Code</p>
              </div>
              <button 
                onClick={() => router.push('/student_scanner')}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Mark Attendance
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Attendance %</p>
                <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h2>
          {attendanceRecords.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No attendance records found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">DATE</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">CHECK-IN TIME</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{record.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(record.time).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">How to mark attendance:</h4>
          <ul className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Show your QR code (displayed above) to the faculty scanner</li>
            <li>First scan of the day will mark your check-in time</li>
            <li>Last scan of the day will mark your check-out time</li>
            <li>You need to scan both at arrival and departure for complete attendance</li>
          </ul>
        </div>
      </main>
    </div>
  );
}