import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHkl_g8tHAKS109IRSCfmKZcs1h7JM2hw",
  authDomain: "pohonkeluargakita-4af0d.firebaseapp.com",
  projectId: "pohonkeluargakita-4af0d",
  storageBucket: "pohonkeluargakita-4af0d.firebasestorage.app",
  messagingSenderId: "247303353629",
  appId: "1:247303353629:web:879acc0849b421eac75df4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);