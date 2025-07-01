// send_notifikasi.js
import express from 'express';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getDatabase } from 'firebase-admin/database';
import fs from 'fs';

const aplikasi = express();
const port = 3000;

aplikasi.use(cors());
aplikasi.use(bodyParser.json());

// 🔐 Inisialisasi Firebase Admin dengan service account
const kredensialService = JSON.parse(fs.readFileSync('./project-unkriswina-firebase-adminsdk-fbsvc-c63d4c29dc.json', 'utf8'));
console.log(kredensialService);


admin.initializeApp({
  credential: admin.credential.cert(kredensialService),
  databaseURL: "https://project-unkriswina-default-rtdb.firebaseio.com/",
});

const database = getDatabase();
const jedaNotifikasi = 30 * 1000;
let waktuTerakhirKirim = 0; // Menyimpan waktu notifikasi terakhir per TPS

// Mengecek data TPS setiap 10 detik
setInterval(async () => {
  try {
    const snapShot = await database.ref("tps").once("value");
    if (!snapShot.exists()) return;

    const semuaTps = snapShot.val();
    const sekarang = Date.now();
    const daftarTpsPenuh = [];

    // Kumpul TPS yang penuh
    for (const [idTps, dataTps] of Object.entries(semuaTps)) {
      const status = dataTps.status;
      const nama = dataTps.nama || idTps;

      // Kirim notifikasi hanya jika status 'Penuh' dan sudah lewat jeda
      if (status === "Penuh") {
        daftarTpsPenuh.push(nama);
      }
    }

    // Kirim Notifikasi
    if (daftarTpsPenuh.length > 0 && (sekarang - waktuTerakhirKirim > jedaNotifikasi)) {
      const tokenSnap = await database.ref("token_petugas").once("value");
      if (!tokenSnap.exists()) return;

      const token = tokenSnap.val().token;
      const title = `⚠️ TPS Penuh (${daftarTpsPenuh.length})`;
      const body = `Mohon segera diangkut dari:\n• ${daftarTpsPenuh.join("\n• ")}`;

      const pesan = {
        notification: {
          title,
          body,
        }, token
      }

      try {
        const respons = await admin.messaging().send(pesan);
        waktuTerakhirKirim = sekarang;
        console.log("✅ Notifikasi dikirim:", respons);
      } catch (err) {
        console.error("❌ Gagal kirim notifikasi:", err);
      }
    }

  } catch (err) {
    console.error("🔥 Gagal membaca data TPS dari Firebase:", err);
  }
}, 10000);

// 🚀 Menjalankan server
aplikasi.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});