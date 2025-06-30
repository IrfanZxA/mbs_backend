const express = require("express");
const router = express.Router();
const verifySiswa = require("../middleware/verifySiswa");

const {
  loginSiswa,
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
  getProfileSiswa,
  getTugasSiswa,
  getJadwalHariIni,
  getJadwalMingguan,
  cekUsername,
} = require("../controllers/siswa.controller");

// ✅ Ini route publik, harus sebelum verifySiswa
router.post("/login", loginSiswa);
router.get("/cek-username/:username", cekUsername);

// 🔐 Semua route di bawah ini butuh token siswa
router.use(verifySiswa);

router.get("/profile", getProfileSiswa);
router.get("/tugas", getTugasSiswa);
router.get("/jadwal-hari-ini", getJadwalHariIni);
router.get("/jadwal-mingguan", getJadwalMingguan);

router.get("/", getAllSiswa);
router.get("/:id", getSiswaById);
router.post("/", addSiswa);
router.put("/:id", updateSiswa);
router.delete("/:id", deleteSiswa);

module.exports = router;
