'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowLeft, Search, UserCheck } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function QRScannerPage() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'attendance'));
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

  const handleScan = async () => {
    if (!rollNumber) {
      setMessage('Please enter a roll number');
      setStatus('error');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // نتأكد إن الطالب مسجلش حضور قبل كده النهاردة
      const q = query(
        collection(db, "attendance"),
        where("studentRoll", "==", rollNumber),
        where("date", "==", today)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // نسجل الحضور في Firebase
        await addDoc(collection(db, "attendance"), {
          studentRoll: rollNumber,
          studentName: 'Unknown', // ممكن نجيب الاسم من الداتابيز
          date: today,
          time: new Date().toISOString(),
          token: 'manual-entry',
          status: 'present'
        });
        
        setStatus('success');
        setMessage(`Attendance marked for ${rollNumber}`);
        fetchAttendance();
      } else {
        setStatus('success');
        setMessage(`${rollNumber} is already marked present today.`);
      }
    } catch (error) {
      console.error("Error: ", error);
      setStatus('error');
      setMessage('Error saving attendance. Please try again.');
    }
  };

  const presentToday = attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.push('/faculty_page')} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" /> Back
            </button>
            <div className="bg-green-600 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">QR Code Scanner</h1>
              <p className="text-sm text-gray-500">Scan student QR codes for attendance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
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
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
          <p className="text-gray-500 mb-6">Students should show their QR code to mark attendance</p>

          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter Roll Number (e.g., 22XV1M6705)"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
            <button
              onClick={handleScan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Scan
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading...</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">STUDENT</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">ROLL NUMBER</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">CHECK-IN</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{record.studentName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{record.studentRoll}</td>
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
      </main>
    </div>
  );
}