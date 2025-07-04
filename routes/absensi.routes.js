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
} = absensiController;

// ✅ Route khusus (harus di atas /:id)
router.get("/guru", getAbsensiGuruByNama);
router.get("/rekap/:kelas_id", getRekapAbsensiByKelas);
router.get("/rekap-siswa", absensiController.getRekapAbsensiSiswa);
router.get("/siswa/:kelas_id", verifyGuru, getSiswaByKelas);

// ✅ Route umum
router.get("/", getAllAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", addAbsensi);
router.post("/bulk", addAbsensiBulk);
router.put("/:id", updateAbsensi);
router.delete("/:id", deleteAbsensi);

module.exports = router;
