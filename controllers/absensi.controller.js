const db = require("../db");

// 🔍 Ambil semua absensi
const getAllAbsensi = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM absensi ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil absensi", err);
    res.status(500).json({ error: "Gagal ambil absensi" });
  }
};

// 🔍 Ambil absensi berdasarkan ID
const getAbsensiById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM absensi WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absensi tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil absensi by ID", err);
    res.status(500).json({ error: "Gagal ambil absensi" });
  }
};

// ➕ Tambah absensi
const addAbsensi = async (req, res) => {
  const { siswa_id, jadwal_id, tanggal, status } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO absensi (
        siswa_id, jadwal_id, tanggal, status
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [siswa_id, jadwal_id, tanggal, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah absensi", err);
    res.status(500).json({ error: "Gagal tambah absensi" });
  }
};

// ✏️ Update absensi
const updateAbsensi = async (req, res) => {
  const { id } = req.params;
  const { siswa_id, jadwal_id, tanggal, status } = req.body;
  try {
    const result = await db.query(
      `UPDATE absensi SET
        siswa_id = $1,
        jadwal_id = $2,
        tanggal = $3,
        status = $4
      WHERE id = $5 RETURNING *`,
      [siswa_id, jadwal_id, tanggal, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absensi tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update absensi", err);
    res.status(500).json({ error: "Gagal update absensi" });
  }
};

// ❌ Hapus absensi
const deleteAbsensi = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM absensi WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absensi tidak ditemukan" });
    }
    res.json({ message: "Absensi berhasil dihapus", absensi: result.rows[0] });
  } catch (err) {
    console.error("Error hapus absensi", err);
    res.status(500).json({ error: "Gagal hapus absensi" });
  }
};

module.exports = {
  getAllAbsensi,
  getAbsensiById,
  addAbsensi,
  updateAbsensi,
  deleteAbsensi,
};
