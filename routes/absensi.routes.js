const express = require("express");
const router = express.Router();
const verifyGuru = require("../middleware/verifyGuru");
const absensiController = require("../controllers/absensi.controller");

const {
  getAllAbsensi,
  getAbsensiById,
  addAbsensi,
  updateAbsensi,
  deleteAbsensi,
  addAbsensiBulk,
  getSiswaByKelas,
  getRekapAbsensiByKelas,
  getAbsensiGuruByNama,
  getStatistikSiswa,
  getStatistikGuru,
  getRekapAbsensiSiswa
} = absensiController;

// ✅ Route khusus (duluan)
router.get("/guru", getAbsensiGuruByNama);
router.get("/rekap/:kelas_id", getRekapAbsensiByKelas);
router.get("/rekap-siswa", getRekapAbsensiSiswa);
router.get("/siswa/:kelas_id", verifyGuru, getSiswaByKelas);

// ✅ Tambahan untuk dashboard akademik
router.get("/statistik-siswa", getStatistikSiswa);
router.get("/statistik-guru", getStatistikGuru);

// ✅ Route umum
router.get("/", getAllAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", addAbsensi);
router.post("/bulk", addAbsensiBulk);
router.put("/:id", updateAbsensi);
router.delete("/:id", deleteAbsensi);

module.exports = router;
