const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.database();

// Fungsi untuk mengirimkan notifikasi setiap 10 menit
exports.kirimNotifikasi = functions.pubsub.schedule("every 10 minutes").onRun(async (context) => {
    try {
        // Membaca data TPS dari Firebase Realtime Database
        const snapshot = await db.ref("tps").once("value");
        if (!snapshot.exists()) return;

        const semuaTps = snapshot.val();
        const waktuSekarang = Date.now();
        const daftarTpsPenuh = [];

        // Menyaring TPS yang statusnya penuh
        for (const [tpsKey, tpsData] of Object.entries(semuaTps)) {
            const status = tpsData.status;
            if (status === "Penuh") {
                daftarTpsPenuh.push(tpsData.nama || tpsKey);
            }
        }

        // Kirim notifikasi jika ada TPS penuh
        if (daftarTpsPenuh.length > 0) {
            const tokenSnapshot = await db.ref("token_petugas").once("value");
            if (!tokenSnapshot.exists()) return;

            const token = tokenSnapshot.val().token;
            const title = `⚠️ TPS Penuh (${daftarTpsPenuh.length})`;
            const body = `Mohon segera diangkut dari:\n• ${daftarTpsPenuh.join("\n• ")}`;

            const pesan = {
                notification: {
                    title,
                    body,
                },
                token,
            };

            try {
                const respons = await admin.messaging().send(pesan);
                console.log("✅ Notifikasi dikirim:", respons);
            } catch (err) {
                console.error("❌ Gagal kirim notifikasi:", err);
            }
        }

    } catch (err) {
        console.error("🔥 Gagal membaca data TPS dari Firebase:", err);
    }
});
