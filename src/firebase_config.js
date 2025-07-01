// Mengimpor modul-modul Firebase yang dibutuhkan
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDAtvEniZzsTtvgCRMuhYh6mi59mAk6Aqc",
  authDomain: "project-unkriswina.firebaseapp.com",
  databaseURL: "https://project-unkriswina-default-rtdb.firebaseio.com",
  projectId: "project-unkriswina",
  storageBucket: "project-unkriswina.firebasestorage.app",
  messagingSenderId: "285848458757",
  appId: "1:285848458757:web:1c579bf385db90893cae6c",
  measurementId: "G-6MHTW41GVP"
};

// Menginisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);

// Mengekspor objek db agar bisa digunakan di tempat lain
export { db, messaging };
