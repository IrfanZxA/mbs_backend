const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Ambil semua data guru
const getAllGuru = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM guru ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil data guru", err);
    res.status(500).json({ error: "Gagal ambil data guru" });
  }
};

// Ambil satu data guru berdasarkan ID
const getGuruById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM guru WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guru tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil guru by ID", err);
    res.status(500).json({ error: "Gagal ambil guru" });
  }
};

const addGuru = async (req, res) => {
  const {
    username,
    password_hash,
    nama_lengkap,
    nip,
    mapel_id,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    no_hp,
    alamat,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO guru (
        username, password_hash, nama_lengkap, nip,
        mapel_id, tempat_lahir, tanggal_lahir, jenis_kelamin,
        no_hp, alamat, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW()) RETURNING *`,
      [
        username,
        password_hash,
        nama_lengkap,
        nip,
        mapel_id,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        no_hp,
        alamat,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah guru", err);
    res.status(500).json({ error: "Gagal tambah guru" });
  }
};

const updateGuru = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password_hash,
    nama_lengkap,
    nip,
    mapel_id,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    no_hp,
    alamat,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE guru SET 
        username = $1,
        password_hash = $2,
        nama_lengkap = $3,
        nip = $4,
        mapel_id = $5,
        tempat_lahir = $6,
        tanggal_lahir = $7,
        jenis_kelamin = $8,
        no_hp = $9,
        alamat = $10
      WHERE id = $11 RETURNING *`,
      [
        username,
        password_hash,
        nama_lengkap,
        nip,
        mapel_id,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        no_hp,
        alamat,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guru tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update guru", err);
    res.status(500).json({ error: "Gagal update guru" });
  }
};

const deleteGuru = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM guru WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guru tidak ditemukan" });
    }

    res.json({ message: "Guru berhasil dihapus", guru: result.rows[0] });
  } catch (err) {
    console.error("Error hapus guru", err);
    res.status(500).json({ error: "Gagal hapus guru" });
  }
};

// ✅ Fungsi login guru
const loginGuru = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM guru WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Username tidak ditemukan" });
    }

    const guru = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, guru.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign({ id: guru.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      guru: {
        id: guru.id,
        nama: guru.nama_lengkap,
        username: guru.username,
      },
    });
  } catch (err) {
    console.error("Login guru gagal:", err);
    res.status(500).json({ error: "Login gagal" });
  }
};

const getProfileGuru = async (req, res) => {
  const guruId = req.guru.id; // Diambil dari token yang sudah diverifikasi middleware

  try {
    const result = await db.query("SELECT id, username, nama_lengkap FROM guru WHERE id = $1", [guruId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guru tidak ditemukan" });
    }

    res.json({ guru: result.rows[0] });
  } catch (err) {
    console.error("Error ambil profil guru", err);
    res.status(500).json({ error: "Gagal ambil profil guru" });
  }
};


module.exports = {
  getAllGuru,
  getGuruById,
  addGuru,
  updateGuru,
  deleteGuru,
  loginGuru, 
  getProfileGuru,
};
