const express = require("express");
const router = express.Router();
const nilaiController = require("../controllers/nilai.controller");
const verifyGuru = require("../middleware/verifyGuru");
const verifySiswa = require("../middleware/verifySiswa");
const {verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

const {
  getAllNilai,
  getNilaiById,
  addNilai,
  updateNilai,
  deleteNilai,
  getRekapNilaiByKelas,
  getRekapNilaiByKelasSemester,
  getLaporanNilaiMapel,
  getNilaiSiswaByMapel,
} = nilaiController;

// ========================
// ✅ ADMIN / GURU / SISWA
// ========================

// --- Untuk Admin (lihat laporan dari dashboard) ---
router.get("/laporan-mapel",verifyToken, verifyAdmin, getLaporanNilaiMapel);
router.get("/rekap", verifyToken, verifyAdmin, getRekapNilaiByKelasSemester);

// --- Untuk Guru ---
router.get("/rekap/:kelasId", verifyGuru, getRekapNilaiByKelas);

// --- Untuk Siswa ---
router.get("/siswa/:mapelId", verifySiswa, getNilaiSiswaByMapel);

// --- General (CRUD Nilai) ---
router.get("/", getAllNilai);
router.post("/", addNilai);
router.put("/:id", updateNilai);
router.delete("/:id", deleteNilai);

// ⚠️ Route dinamis HARUS di paling bawah
router.get("/:id", getNilaiById);

module.exports = router;
