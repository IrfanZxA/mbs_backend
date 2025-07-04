const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller"); // ✅ Tambahkan ini!

const {
  loginAdmin,
  getAdminProfile,
  nonaktifkanSiswa
} = adminController;

const {
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
} = require("../controllers/siswa.controller");

const verifyToken = require("../middleware/auth.middleware");
const verifyAdmin = require("../middleware/auth.middleware");

// Manajemen data siswa oleh admin
router.get("/siswa", verifyToken, getAllSiswa);
router.get("/siswa/:id", verifyToken, getSiswaById);
router.post("/siswa", verifyToken, addSiswa);
router.put("/siswa/:id", verifyToken, updateSiswa);
router.delete("/siswa/:id", verifyToken, deleteSiswa);

// ✅ Tambah guru
router.post("/guru", verifyToken, adminController.addGuruWithJadwal);

// ✅ Nonaktifkan akun siswa
router.patch("/admin/siswa/:id/nonaktif", verifyAdmin, nonaktifkanSiswa);

// ✅ Login & Profile
router.post("/login", loginAdmin);
router.get("/profile", verifyToken, getAdminProfile);

module.exports = router;
