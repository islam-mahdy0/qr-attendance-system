import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKzWER6r0CZ9zyTpiM-8hgEVo8UTOYwPs",
  authDomain: "qr-attendance-completion.firebaseapp.com",
  projectId: "qr-attendance-completion",
  storageBucket: "qr-attendance-completion.firebasestorage.app",
  messagingSenderId: "1052059070233",
  appId: "1:1052059070233:web:dd76c65c00d05bc7fd5f88",
  measurementId: "G-6PJYZR59YT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);