import { db, messaging } from "./firebase_config";
import { ref, onValue, set } from "firebase/database";
import { getToken, onMessage } from "firebase/messaging";

// Ambil token perangkat untuk notifikasi
getToken(messaging, {
  vapidKey: "BFUPra79dc4bAr2Q61FxX2-iSRcRM4Fd5vP7rir1XavxLnsjaZUVudHYI2vBHIA8GN_qfikjyOy5im3Eyq2gMe8"
}).then((tokenSekarang) => {
  if (tokenSekarang) {
    set(ref(db, "token_petugas/"), { token: tokenSekarang });
  } else {
    console.warn("❗ Izin notifikasi tidak diberikan atau token tidak tersedia.");
  }
}).catch((err) => {
  console.error("🔥 Gagal mendapatkan token:", err);
});

// Inisialisasi peta dan marker group
let mapTps;
let markerGrup = L.layerGroup();

function mapTpsInit() {
  mapTps = L.map("map_tps").setView([-9.6561, 120.2646], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapTps);
  markerGrup.addTo(mapTps);
}

// Ambil dan tampilkan data TPS
function logikaTps() {
  const semuaTpsRef = ref(db, "tps");

  onValue(semuaTpsRef, (snapshot) => {
    const semuaTps = snapshot.val();
    const totalSemuaTps = Object.keys(semuaTps).length;
    document.getElementById("total_tps").textContent = totalSemuaTps;

    let jumlahPenuh = 0;
    let jumlahHampirPenuh = 0;
    let jumlahKosong = 0;

    // Bersihkan marker sebelumnya
    markerGrup.clearLayers();

    Object.entries(semuaTps).forEach(([idTps, data]) => {
      const id = idTps.split("_")[1];
      const status = data.status;
      const nama = data.nama;
      const lokasi = data.location;

      if (status === "Penuh") jumlahPenuh++;
      else if (status === "Hampir Penuh") jumlahHampirPenuh++;
      else if (status === "Kosong") jumlahKosong++;

      document.getElementById("tps_penuh").textContent = jumlahPenuh;
      document.getElementById("tps_hampir_penuh").textContent = jumlahHampirPenuh;
      document.getElementById("tps_kosong").textContent = jumlahKosong;

      // Update tampilan box kartu TPS
      const classBorderTps = document.getElementById(`class_border_tps_${id}`);
      const statusTps = document.getElementById(`status_tps_${id}`);
      const namaTps = document.getElementById(`nama_tps_${id}`);
      const markerTps = document.getElementById(`marker_map_tps_${id}`);

      if (classBorderTps) {
        if (status === "Penuh") classBorderTps.className = "h-2 bg-red-500";
        else if (status === "Hampir Penuh") classBorderTps.className = "h-2 bg-yellow-400";
        else if (status === "Kosong") classBorderTps.className = "h-2 bg-gray-400";
      }

      if (statusTps) {
        statusTps.textContent = status;
        if (status === "Penuh") statusTps.className = "status-badge flex bg-red-100 text-red-800";
        else if (status === "Hampir Penuh") statusTps.className = "status-badge flex bg-yellow-100 text-yellow-800";
        else if (status === "Kosong") statusTps.className = "status-badge flex bg-gray-100 text-gray-800";
      }

      if (namaTps) {
        namaTps.textContent = nama;
      }

      if (markerTps) {
        if (status === "Penuh") markerTps.className = "w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold";
        else if (status === "Hampir Penuh") markerTps.className = "w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold";
        else if (status === "Kosong") markerTps.className = "w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold";
      }

      // Tampilkan marker ke peta jika ada lokasi
      if (lokasi && lokasi.lat !== undefined && lokasi.lon !== undefined) {
        let warna = "bg-gray-400";
        if (status === "Penuh") warna = "bg-red-500";
        else if (status === "Hampir Penuh") warna = "bg-yellow-400";

        const marker = L.marker([lokasi.lat, lokasi.lon], {
          icon: L.divIcon({
            html: `<div id="marker_map_tps_${id}" class="w-8 h-8 rounded-full ${warna} flex items-center justify-center text-white font-bold">${id}</div>`,
            className: "custom-icon"
          })
        });

        marker.bindPopup(`
                    <div class="text-sm leading-snug">
                        <div class="font-bold text-gray-800">${nama}</div>
                        <div>Status: <span class="font-semibold">${status}</span></div>
                        <div>Koordinat: <span class="text-xs text-gray-600">[${lokasi.lat.toFixed(5)}, ${lokasi.lon.toFixed(5)}]</span></div>
                    </div>
                `);

        marker.addTo(markerGrup);
      }
    });
  });
}

// Notifikasi hanya sekali
onMessage(messaging, (payload) => {
  Swal.fire({
    title: payload.notification.title || "Notifikasi Baru",
    html: (payload.notification.body || "Ada update dari sistem.").replace(/\n/g, "<br>"),
    icon: "info", // Bisa: 'success', 'error', 'warning', 'question'
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 10000,
    timerProgressBar: true,
    background: "#ffffff",
    color: "#333",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer)
      toast.addEventListener("mouseleave", Swal.resumeTimer)
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  mapTpsInit();
  logikaTps();
});
