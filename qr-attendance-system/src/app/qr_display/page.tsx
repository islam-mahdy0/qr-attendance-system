'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Users, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function QRDisplay() {
  const router = useRouter();
  const [qrData, setQrData] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [facultyInfo, setFacultyInfo] = useState<any>(null);
  const [presentCount, setPresentCount] = useState(0);

  const generateQRCode = () => {
    // بناخد هوية الدكتور + وقت عشوائي عشان الكود يتغير وميبقاش ثابت
    const facultyId = facultyInfo?.id || 'unknown';
    const timestamp = Date.now().toString(36);
    const newToken = `${facultyId}_${timestamp}`;
    setQrData(newToken);
    setTimeRemaining(30);
  };

  useEffect(() => {
    const facultyAuth = localStorage.getItem('facultyAuthenticated');
    const currentFaculty = localStorage.getItem('currentFaculty');

    if (!facultyAuth || !currentFaculty) {
      router.push('/');
      return;
    }

    const parsedFaculty = JSON.parse(currentFaculty);
    setFacultyInfo(parsedFaculty);

    // نولع الكود أول مرة
    const facultyId = parsedFaculty.id || 'unknown';
    const timestamp = Date.now().toString(36);
    setQrData(`${facultyId}_${timestamp}`);

    const qrInterval = setInterval(() => {
      const facultyId = parsedFaculty.id || 'unknown';
      const timestamp = Date.now().toString(36);
      setQrData(`${facultyId}_${timestamp}`);
      setTimeRemaining(30);
    }, 30000);

    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    // نحسب عدد الحضور الخاصين بالدكتور ده بس
    const fetchPresentCount = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, "attendance"),
          where("facultyId", "==", parsedFaculty.id),
          where("date", "==", today),
          where("status", "==", "present")
        );
        const querySnapshot = await getDocs(q);
        setPresentCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching count: ", error);
      }
    };

    fetchPresentCount();

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdownInterval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/faculty_page')} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center text-green-600 font-semibold">
            <RefreshCw className="w-5 h-5 mr-2" /> Attendance QR
          </div>
        </div>

        {facultyInfo && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Faculty: {facultyInfo.fullName || 'Faculty'}</h2>
          </div>
        )}

        <div className="bg-gray-100 rounded-xl p-6 mb-6 flex flex-col items-center justify-center min-h-[250px]">
          {qrData ? (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <QRCodeSVG value={qrData} size={192} />
              </div>
              <p className="text-sm text-gray-500 break-all px-4">Token: {qrData}</p>
            </div>
          ) : (
            <p className="text-gray-500">Generating QR Code...</p>
          )}
        </div>

        <div className="flex items-center justify-center mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
            Session Active
          </span>
        </div>

        <div className="flex items-center justify-center text-gray-600 mb-6">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refreshes in: <span className="font-bold ml-1">{timeRemaining}s</span>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-blue-800">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-lg font-semibold">Present Today: {presentCount}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Instructions: Students should scan this QR code using their mobile app to mark attendance.
        </p>
      </div>
    </div>
  );
}