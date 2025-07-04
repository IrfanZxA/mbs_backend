const express = require("express");
const router = express.Router();
const guruController = require("../controllers/guru.controller");
const verifyGuru = require("../middleware/verifyGuru");
const { getJadwalUjian } = require('../controllers/guru.controller');

const {
  loginGuru,
  getAllGuru,
  getGuruById,
  addGuru,
  updateGuru,
  deleteGuru,
  getProfileGuru,
  getJumlahKelasHariIni,
  getJumlahSiswaAktif,  
  getRataRataNilaiPerKelas,
  getJadwalHariIniGuru,
  getPengumpulanTugas,
  getJadwalGuru,
} = guruController;

// ✅ Endpoint login & profil
router.post("/login", loginGuru);
router.get("/profile", verifyGuru, getProfileGuru);

// ✅ Dashboard khusus guru
router.get("/jumlah-kelas-hari-ini", verifyGuru, getJumlahKelasHariIni);
router.get("/siswa-aktif", verifyGuru, getJumlahSiswaAktif);
router.get("/rata-rata-nilai", verifyGuru, getRataRataNilaiPerKelas);
router.get("/jadwal-harian", verifyGuru, getJadwalHariIniGuru);
router.get('/jadwal', verifyGuru, getJadwalGuru);
router.get('/jadwal-ujian/:kelasId', verifyGuru, getJadwalUjian);


// ✅ Endpoint pengumpulan tugas
router.get("/tugas/:tugasId/pengumpulan", verifyGuru, getPengumpulanTugas);

// ✅ Ambil semua kelas yang diajar guru (berdasarkan jadwal)
router.get("/kelas", verifyGuru, async (req, res) => {
  const guruId = req.user.id;

  try {
    const result = await require("../db").query(`
      SELECT DISTINCT k.id, k.nama_kelas
      FROM kelas k
      JOIN jadwal j ON j.kelas_id = k.id
      WHERE j.guru_id = $1
      ORDER BY k.nama_kelas
    `, [guruId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Gagal ambil kelas guru", err);
    res.status(500).json({ error: "Gagal ambil kelas guru" });
  }
});

// ✅ CRUD guru
router.get("/", getAllGuru);
router.post("/", addGuru);
router.put("/:id", updateGuru);
router.delete("/:id", deleteGuru);

// ⛔❗ HARUS DITARUH TERAKHIR, JANGAN DI ATAS YANG LAIN
router.get("/:id", getGuruById);

module.exports = router;
