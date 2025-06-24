const db = require("../db");

// 🔍 Ambil semua data siswa
const getAllSiswa = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM siswa ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil data siswa", err);
    res.status(500).json({ error: "Gagal ambil data siswa" });
  }
};

// 🔍 Ambil satu siswa berdasarkan ID
const getSiswaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM siswa WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil siswa by ID", err);
    res.status(500).json({ error: "Gagal ambil siswa" });
  }
};

// ➕ Tambah siswa
const addSiswa = async (req, res) => {
  const {
    username,
    password_hash,
    orang_tua_id,
    nama_lengkap,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    kelas_id,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO siswa (
        username, password_hash, orang_tua_id,
        nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, kelas_id, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
      [
        username,
        password_hash,
        orang_tua_id,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        kelas_id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah siswa", err);
    res.status(500).json({ error: "Gagal tambah siswa" });
  }
};

// ✏️ Update siswa
const updateSiswa = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password_hash,
    orang_tua_id,
    nama_lengkap,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    kelas_id,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE siswa SET
        username = $1,
        password_hash = $2,
        orang_tua_id = $3,
        nama_lengkap = $4,
        tempat_lahir = $5,
        tanggal_lahir = $6,
        jenis_kelamin = $7,
        kelas_id = $8
      WHERE id = $9 RETURNING *`,
      [
        username,
        password_hash,
        orang_tua_id,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        kelas_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update siswa", err);
    res.status(500).json({ error: "Gagal update siswa" });
  }
};

// ❌ Hapus siswa
const deleteSiswa = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM siswa WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }

    res.json({ message: "Siswa berhasil dihapus", siswa: result.rows[0] });
  } catch (err) {
    console.error("Error hapus siswa", err);
    res.status(500).json({ error: "Gagal hapus siswa" });
  }
};

module.exports = {
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
};
