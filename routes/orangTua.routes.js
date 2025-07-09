const express = require("express");
const router = express.Router();
const verifyOrangTua = require("../middleware/verifyOrangTua");

const {
  getAllOrangTua,
  getOrangTuaById,
  addOrangTua,
  updateOrangTua,
  deleteOrangTua,
  loginOrangTua,
  getProfileOrangTua,
  getTugasAnak,
  getJadwalHariIniAnak,
  getJadwalMingguanAnak,
  getNilaiAnakByMapel,
  getPresensiAnakByBulan, 
} = require("../controllers/orangTua.controller");

// 🔓 Public: Login
router.post("/login", loginOrangTua);

// 🔐 Protected: Semua setelah ini wajib token orang tua
router.use(verifyOrangTua);

// 🔎 Profil & Dashboard Anak
router.get("/profile", getProfileOrangTua);
router.get("/tugas", getTugasAnak);
router.get("/jadwal-hari-ini", getJadwalHariIniAnak);
router.get("/jadwal-mingguan", getJadwalMingguanAnak);
router.get('/nilai/:mapelId', verifyOrangTua, getNilaiAnakByMapel);
router.get("/presensi", verifyOrangTua, getPresensiAnakByBulan);



// 🔧 Manajemen Orang Tua (opsional untuk admin atau ortu sendiri)
router.get("/", getAllOrangTua);
router.post("/", addOrangTua);
router.get("/:id", getOrangTuaById);
router.put("/:id", updateOrangTua);
router.delete("/:id", deleteOrangTua);

module.exports = router;
