const express = require("express");
const router = express.Router();

const {
  getAllMateri,
  getMateriById,
  addMateri,
  updateMateri,
  deleteMateri,
  addMateriToDB, // ini fungsi tambahan khusus upload
} = require("../controllers/materi.controller");

const upload = require("../middleware/upload");

// 🔍 Ambil semua materi
router.get("/", getAllMateri);

// 🔍 Ambil materi by ID
router.get("/:id", getMateriById);

// ➕ Tambah materi dengan file upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { guru_id, jadwal_id, judul, deskripsi } = req.body;
    const tanggal_upload = new Date();
    const file_url = req.file ? `/uploads/materi/${req.file.filename}` : null;

    const result = await addMateriToDB({
      guru_id,
      jadwal_id,
      judul,
      deskripsi,
      file_url,
      tanggal_upload,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Gagal upload materi:", err);
    res.status(500).json({ error: "Gagal upload materi" });
  }
});

// ✏️ Update materi (optional: bisa pakai upload.single("file") juga kalau mau update file)
router.put("/:id", updateMateri);

// ❌ Hapus materi
router.delete("/:id", deleteMateri);

module.exports = router;
