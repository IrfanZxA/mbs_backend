const express = require("express");
const router = express.Router();

// ✅ Import controller admin
const {
  loginAdmin,
  getAdminProfile,
  nonaktifkanSiswa,
  addGuruWithJadwal
} = require("../controllers/admin.controller");

// ✅ Import controller siswa
const {
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa
} = require("../controllers/siswa.controller");

// ✅ Import middleware
const {
  verifyToken,
  verifyAdmin
} = require("../middleware/auth.middleware");

// ========================
// 🔐 Auth & Profil Admin
// ========================
router.post("/login", loginAdmin);
router.get("/profile", verifyToken, verifyAdmin, getAdminProfile);

// ========================
// 👨‍🎓 Manajemen Siswa
// ========================
router.get("/siswa", verifyToken, verifyAdmin, getAllSiswa);
router.get("/siswa/:id", verifyToken, verifyAdmin, getSiswaById);
router.post("/siswa", verifyToken, verifyAdmin, addSiswa);
router.put("/siswa/:id", verifyToken, verifyAdmin, updateSiswa);
router.delete("/siswa/:id", verifyToken, verifyAdmin, deleteSiswa);

// ✅ Nonaktifkan akun siswa
router.patch("/siswa/:id/nonaktif", verifyToken, verifyAdmin, nonaktifkanSiswa);

// ========================
// 👨‍🏫 Tambah Guru & Jadwal
// ========================
router.post("/guru", verifyToken, verifyAdmin, addGuruWithJadwal);

module.exports = router;
