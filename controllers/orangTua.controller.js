const db = require("../db");

// 🔍 Ambil semua orang tua
const getAllOrangTua = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM orang_tua ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil orang tua", err);
    res.status(500).json({ error: "Gagal ambil orang tua" });
  }
};

// 🔍 Ambil orang tua berdasarkan ID
const getOrangTuaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM orang_tua WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Orang tua tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil orang tua by ID", err);
    res.status(500).json({ error: "Gagal ambil orang tua" });
  }
};

// ➕ Tambah orang tua
const addOrangTua = async (req, res) => {
  const {
    username,
    password_hash,
    nama_lengkap,
    nik,
    alamat,
    no_hp
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO orang_tua (
        username, password_hash, nama_lengkap, nik,
        alamat, no_hp, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [username, password_hash, nama_lengkap, nik, alamat, no_hp]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah orang tua", err);
    res.status(500).json({ error: "Gagal tambah orang tua" });
  }
};

// ✏️ Update orang tua
const updateOrangTua = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password_hash,
    nama_lengkap,
    nik,
    alamat,
    no_hp
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE orang_tua SET
        username = $1,
        password_hash = $2,
        nama_lengkap = $3,
        nik = $4,
        alamat = $5,
        no_hp = $6
      WHERE id = $7 RETURNING *`,
      [username, password_hash, nama_lengkap, nik, alamat, no_hp, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Orang tua tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update orang tua", err);
    res.status(500).json({ error: "Gagal update orang tua" });
  }
};

// ❌ Hapus orang tua
const deleteOrangTua = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM orang_tua WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Orang tua tidak ditemukan" });
    }

    res.json({ message: "Orang tua berhasil dihapus", orang_tua: result.rows[0] });
  } catch (err) {
    console.error("Error hapus orang tua", err);
    res.status(500).json({ error: "Gagal hapus orang tua" });
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Login Orang Tua
const loginOrangTua = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM orang_tua WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Username tidak ditemukan" });
    }

    const ortu = result.rows[0];
    const isMatch = await bcrypt.compare(password, ortu.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign({ id: ortu.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      orang_tua: {
        id: ortu.id,
        nama: ortu.nama_lengkap,
        username: ortu.username,
      },
    });
  } catch (err) {
    console.error("Login orang tua gagal:", err);
    res.status(500).json({ error: "Login gagal" });
  }
};

// ✅ Ambil profil orang tua
const getProfileOrangTua = async (req, res) => {
  const id = req.orangTua.id;

  try {
    const result = await db.query(
      "SELECT id, username, nama_lengkap, no_hp FROM orang_tua WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Data orang tua tidak ditemukan" });
    }

    res.json({ orang_tua: result.rows[0] });
  } catch (err) {
    console.error("Gagal ambil profil orang tua:", err);
    res.status(500).json({ error: "Gagal ambil profil" });
  }
};

module.exports = {
  getAllOrangTua,
  getOrangTuaById,
  addOrangTua,
  updateOrangTua,
  deleteOrangTua,
  loginOrangTua,
  getProfileOrangTua,
};
