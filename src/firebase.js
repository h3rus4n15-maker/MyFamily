import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Ini adalah "brankas" konfigurasi Anda di Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pohonkeluargakita-4af0d.firebaseapp.com",
  projectId: "pohonkeluargakita-4af0d",
  storageBucket: "pohonkeluargakita-4af0d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor Firestore (database) dan Auth agar bisa dipakai di file lain
export const db = getFirestore(app);
export const auth = getAuth(app);
