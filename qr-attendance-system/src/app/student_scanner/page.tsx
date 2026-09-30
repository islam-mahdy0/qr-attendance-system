'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function StudentScanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const studentAuth = localStorage.getItem('studentAuthenticated');
    if (!studentAuth) {
      router.push('/');
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanning(false);
        
        const currentStudent = localStorage.getItem('currentStudent');
        const student = currentStudent ? JSON.parse(currentStudent) : null;
        
        if (student) {
          try {
            // فك التوكن: بناخد هوية الدكتور من أول جزء
            const facultyId = decodedText.split('_')[0];
            const today = new Date().toISOString().split('T')[0];
            
            // نتأكد إن الطالب مسجلش حضور مع الدكتور ده قبل كده النهاردة
            const q = query(
              collection(db, "attendance"),
              where("studentId", "==", student.id),
              where("facultyId", "==", facultyId),
              where("date", "==", today)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
              // نسجل الحضور في Firebase مربوط بالدكتور
              await addDoc(collection(db, "attendance"), {
                studentId: student.id,
                studentName: student.fullName,
                studentRoll: student.rollNumber,
                facultyId: facultyId,
                date: today,
                time: new Date().toISOString(),
                token: decodedText,
                status: 'present'
              });
              
              setStatus('success');
              setMessage('Attendance marked successfully!');
            } else {
              setStatus('success');
              setMessage('You are already marked present today.');
            }
          } catch (error) {
            console.error("Error adding document: ", error);
            setStatus('error');
            setMessage('Error saving attendance. Please try again.');
          }
        }
      },
      (error) => {
        // بنتجاهل أخطاء المسح المستمرة
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/student_page')} className="flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center text-blue-400 font-semibold">
            <Camera className="w-5 h-5 mr-2" /> Scan QR
          </div>
        </div>

        <div className="bg-black rounded-xl p-6 mb-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
          {scanning ? (
            <div className="text-center w-full">
              <div id="reader" className="w-full"></div>
              <p className="mt-4 text-gray-400">Point your camera at the QR code...</p>
            </div>
          ) : (
            <div className="text-center">
              {status === 'success' ? (
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
              )}
              <p className="text-xl font-bold">{message}</p>
            </div>
          )}
        </div>

        {!scanning && (
          <button 
            onClick={() => { setScanning(true); setStatus('idle'); setMessage(''); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Scan Again
          </button>
        )}

      </div>
    </div>
  );
}