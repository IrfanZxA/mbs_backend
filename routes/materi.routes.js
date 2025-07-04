const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyGuru = require("../middleware/verifyGuru");

const {
  getAllMateri,
  getMateriById,
  addMateri,
  updateMateri,
  deleteMateri,
} = require("../controllers/materi.controller");

// 🔍 Ambil semua materi
router.get("/", getAllMateri);

// 🔍 Ambil materi by ID
router.get("/:id", getMateriById);

// ➕ Tambah materi (dengan file upload & token guru login)
router.post("/", verifyGuru, upload.single("file"), addMateri);

// ✏️ Update materi (jika perlu bisa tambahkan upload.single("file"))
router.put("/:id", updateMateri);

// ❌ Hapus materi
router.delete("/:id", deleteMateri);

module.exports = router;
