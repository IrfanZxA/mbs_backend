const db = require("../db");

// 🔍 Ambil semua data kelas
const getAllKelas = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM kelas ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil kelas", err);
    res.status(500).json({ error: "Gagal ambil data kelas" });
  }
};

// 🔍 Ambil data kelas berdasarkan ID
const getKelasById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM kelas WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kelas tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil kelas by ID", err);
    res.status(500).json({ error: "Gagal ambil data kelas" });
  }
};

// ➕ Tambah kelas
const addKelas = async (req, res) => {
  const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, semester, aktif } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO kelas 
      (nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, semester, aktif)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, semester, aktif]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah kelas", err);
    res.status(500).json({ error: "Gagal tambah kelas" });
  }
};

// ✏️ Update kelas
const updateKelas = async (req, res) => {
  const { id } = req.params;
  const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, semester, aktif } = req.body;

  try {
    const result = await db.query(
      `UPDATE kelas SET
        nama_kelas = $1,
        tingkat = $2,
        wali_kelas_id = $3,
        tahun_ajaran = $4,
        semester = $5,
        aktif = $6
      WHERE id = $7 RETURNING *`,
      [nama_kelas, tingkat, wali_kelas_id, tahun_ajaran, semester, aktif, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kelas tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update kelas", err);
    res.status(500).json({ error: "Gagal update kelas" });
  }
};

// ❌ Hapus kelas
const deleteKelas = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM kelas WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kelas tidak ditemukan" });
    }

    res.json({ message: "Kelas berhasil dihapus", kelas: result.rows[0] });
  } catch (err) {
    console.error("Error hapus kelas", err);
    res.status(500).json({ error: "Gagal hapus kelas" });
  }
};

// ✅ Jangan lupa export semua
module.exports = {
  getAllKelas,
  getKelasById,
  addKelas,
  updateKelas,
  deleteKelas,
};
