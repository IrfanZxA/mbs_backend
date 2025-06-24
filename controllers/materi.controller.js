const db = require("../db");

// 🔍 Ambil semua materi
const getAllMateri = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM materi ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil materi", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

// 🔍 Ambil materi berdasarkan ID
const getMateriById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM materi WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Materi tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil materi by ID", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

// ➕ Tambah materi
const addMateri = async (req, res) => {
  const { guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO materi (
        guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah materi", err);
    res.status(500).json({ error: "Gagal tambah materi" });
  }
};

// ✏️ Edit materi
const updateMateri = async (req, res) => {
  const { id } = req.params;
  const { guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload } = req.body;
  try {
    const result = await db.query(
      `UPDATE materi SET 
        guru_id = $1,
        jadwal_id = $2,
        judul = $3,
        deskripsi = $4,
        file_url = $5,
        tanggal_upload = $6
      WHERE id = $7 RETURNING *`,
      [guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Materi tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update materi", err);
    res.status(500).json({ error: "Gagal update materi" });
  }
};

// ❌ Hapus materi
const deleteMateri = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM materi WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Materi tidak ditemukan" });
    res.json({ message: "Materi berhasil dihapus", materi: result.rows[0] });
  } catch (err) {
    console.error("Error hapus materi", err);
    res.status(500).json({ error: "Gagal hapus materi" });
  }
};

module.exports = {
  getAllMateri,
  getMateriById,
  addMateri,
  updateMateri,
  deleteMateri,
};
