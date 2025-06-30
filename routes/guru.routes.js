const express = require("express");
const router = express.Router();
const guruController = require("../controllers/guru.controller");
const verifyGuru = require("../middleware/verifyGuru");

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
} = guruController;

// ✅ Endpoint login & profil
router.post("/login", loginGuru);
router.get("/profile", verifyGuru, getProfileGuru);

// ✅ Dashboard khusus guru
router.get("/jumlah-kelas-hari-ini", verifyGuru, getJumlahKelasHariIni);
router.get("/siswa-aktif", verifyGuru, getJumlahSiswaAktif);
router.get("/rata-rata-nilai", verifyGuru, guruController.getRataRataNilaiPerKelas);
router.get("/jadwal-harian", verifyGuru, guruController.getJadwalHariIniGuru);

// ✅ CRUD guru
router.get("/", getAllGuru);
router.post("/", addGuru);
router.put("/:id", updateGuru);
router.delete("/:id", deleteGuru);

// ❗ Harus paling akhir!
router.get("/:id", getGuruById);

module.exports = router;
