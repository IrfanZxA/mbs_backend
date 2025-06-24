const db = require("../db");

// 🔍 Ambil semua nilai
const getAllNilai = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM nilai ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil nilai", err);
    res.status(500).json({ error: "Gagal ambil nilai" });
  }
};

// 🔍 Ambil nilai berdasarkan ID
const getNilaiById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM nilai WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil nilai by ID", err);
    res.status(500).json({ error: "Gagal ambil nilai" });
  }
};

// ➕ Tambah nilai
const addNilai = async (req, res) => {
  const { siswa_id, mapel_id, jenis_nilai, nilai, tanggal, semester } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO nilai (
        siswa_id, mapel_id, jenis_nilai, nilai, tanggal, semester
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [siswa_id, mapel_id, jenis_nilai, nilai, tanggal, semester]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah nilai", err);
    res.status(500).json({ error: "Gagal tambah nilai" });
  }
};

// ✏️ Update nilai
const updateNilai = async (req, res) => {
  const { id } = req.params;
  const { siswa_id, mapel_id, jenis_nilai, nilai, tanggal, semester } = req.body;
  try {
    const result = await db.query(
      `UPDATE nilai SET 
        siswa_id = $1,
        mapel_id = $2,
        jenis_nilai = $3,
        nilai = $4,
        tanggal = $5,
        semester = $6
      WHERE id = $7 RETURNING *`,
      [siswa_id, mapel_id, jenis_nilai, nilai, tanggal, semester, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update nilai", err);
    res.status(500).json({ error: "Gagal update nilai" });
  }
};

// ❌ Hapus nilai
const deleteNilai = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM nilai WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }
    res.json({ message: "Nilai berhasil dihapus", nilai: result.rows[0] });
  } catch (err) {
    console.error("Error hapus nilai", err);
    res.status(500).json({ error: "Gagal hapus nilai" });
  }
};

module.exports = {
  getAllNilai,
  getNilaiById,
  addNilai,
  updateNilai,
  deleteNilai,
};
