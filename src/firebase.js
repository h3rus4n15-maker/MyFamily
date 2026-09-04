import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCpD27zaFcJY6stNomUmIUM3R9IFWBYook',
  authDomain: 'myfamily-pro.firebaseapp.com',
  projectId: 'myfamily-pro',
  storageBucket: 'myfamily-pro.firebasestorage.app',
  messagingSenderId: '136717860768',
  appId: '1:136717860768:web:1e935273caa1e1bb6baec5',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;