// ===== controllers/mapel.controller.js =====
const db = require("../db");

// 🔍 Ambil semua mapel
const getAllMapel = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM mapel ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil data mapel", err);
    res.status(500).json({ error: "Gagal ambil data mapel" });
  }
};

// 🔍 Ambil mapel by ID
const getMapelById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM mapel WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mapel tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil mapel by ID", err);
    res.status(500).json({ error: "Gagal ambil mapel" });
  }
};

// ➕ Tambah mapel
const addMapel = async (req, res) => {
  const { kode_mapel, nama_mapel, kelompok, jam_pelajaran, deskripsi } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO mapel (kode_mapel, nama_mapel, kelompok, jam_pelajaran, deskripsi)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [kode_mapel, nama_mapel, kelompok, jam_pelajaran, deskripsi]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah mapel", err);
    res.status(500).json({ error: "Gagal tambah mapel" });
  }
};

// ✏️ Update mapel
const updateMapel = async (req, res) => {
  const { id } = req.params;
  const { kode_mapel, nama_mapel, kelompok, jam_pelajaran, deskripsi } = req.body;
  try {
    const result = await db.query(
      `UPDATE mapel SET kode_mapel = $1, nama_mapel = $2, kelompok = $3,
       jam_pelajaran = $4, deskripsi = $5 WHERE id = $6 RETURNING *`,
      [kode_mapel, nama_mapel, kelompok, jam_pelajaran, deskripsi, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mapel tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update mapel", err);
    res.status(500).json({ error: "Gagal update mapel" });
  }
};

// ❌ Hapus mapel
const deleteMapel = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM mapel WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mapel tidak ditemukan" });
    }
    res.json({ message: "Mapel berhasil dihapus", mapel: result.rows[0] });
  } catch (err) {
    console.error("Error hapus mapel", err);
    res.status(500).json({ error: "Gagal hapus mapel" });
  }
};

module.exports = {
  getAllMapel,
  getMapelById,
  addMapel,
  updateMapel,
  deleteMapel,
};