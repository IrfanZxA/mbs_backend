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
  const guruId = req.user.id;

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

// 🔹 Ambil jumlah kelas yang diajar hari ini
const getJumlahKelasHariIni = async (req, res) => {
  const guruId = req.user.id;

  // Dapatkan hari sekarang dalam format "Senin", "Selasa", dst
  const hariIni = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT kelas_id) AS jumlah_kelas
       FROM jadwal
       WHERE guru_id = $1 AND hari = $2`,
      [guruId, hariIni]
    );

    res.json({ jumlah_kelas: result.rows[0].jumlah_kelas });
  } catch (err) {
    console.error("Error ambil jumlah kelas hari ini:", err);
    res.status(500).json({ error: "Gagal ambil jumlah kelas hari ini" });
  }
};

const getJumlahSiswaAktif = async (req, res) => {
  const guruId = req.user.id;

  try {
    const result = await db.query(`
      SELECT COUNT(*) AS total_siswa
      FROM siswa
      WHERE kelas_id IN (
        SELECT DISTINCT kelas_id FROM jadwal WHERE guru_id = $1
      )
    `, [guruId]);

    res.json({ total_siswa: result.rows[0].total_siswa });
  } catch (err) {
    console.error("Error ambil jumlah siswa aktif:", err);
    res.status(500).json({ error: "Gagal ambil jumlah siswa aktif" });
  }
};

const getRataRataNilaiPerKelas = async (req, res) => {
  const guruId = req.user.id;

  try {
    const result = await db.query(`
      SELECT 
        k.nama_kelas,
        ROUND(AVG(n.nilai), 2) AS rata_rata
      FROM nilai n
      JOIN kelas k ON k.id = n.kelas_id
      JOIN jadwal j ON j.kelas_id = k.id AND j.mapel_id = n.mapel_id
      WHERE j.guru_id = $1
      GROUP BY k.nama_kelas
      ORDER BY k.nama_kelas;
    `, [guruId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil rata-rata nilai:", err);
    res.status(500).json({ message: "Gagal ambil rata-rata nilai" });
  }
};

const getJadwalHariIniGuru = async (req, res) => {
  const guruId = req.user.id; // ✅ dari token
  const hariIni = new Date().toLocaleString("id-ID", { weekday: "long" }); // contoh: "Senin", "Selasa", dll

  try {
    const result = await db.query(
      `SELECT 
        j.jam_mulai, 
        j.jam_selesai, 
        k.nama_kelas, 
        m.nama_mapel
      FROM jadwal j
      JOIN kelas k ON j.kelas_id = k.id
      JOIN mapel m ON j.mapel_id = m.id
      WHERE j.guru_id = $1 AND j.hari = $2
      ORDER BY j.jam_mulai ASC`,
      [guruId, hariIni]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil jadwal harian guru:", err);
    res.status(500).json({ error: "Gagal mengambil jadwal harian" });
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
  getJumlahKelasHariIni,
  getJumlahSiswaAktif,
  getRataRataNilaiPerKelas,
  getJadwalHariIniGuru,
};
