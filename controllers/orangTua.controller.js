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
  const id = req.user.id;

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

// orangTua.controller.js
const getTugasAnak = async (req, res) => {
  const orangTuaId = req.user.id;

  try {
    const result = await db.query(`
      SELECT 
        t.id, t.judul, t.deskripsi, t.tanggal_deadline, m.judul AS judul_materi, s.nama_lengkap AS nama_siswa
      FROM tugas t
      JOIN materi m ON t.materi_id = m.id
      JOIN jadwal j ON m.jadwal_id = j.id
      JOIN siswa s ON j.kelas_id = s.kelas_id
      WHERE s.orang_tua_id = $1
      ORDER BY t.tanggal_deadline ASC
    `, [orangTuaId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Gagal ambil tugas anak:', err);
    res.status(500).json({ error: 'Gagal ambil tugas anak' });
  }
};

const getJadwalHariIniAnak = async (req, res) => {
  const orangTuaId = req.user.id;
  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();

  try {
    const result = await db.query(`
      SELECT 
        j.hari, j.jam_mulai, j.jam_selesai,
        m.nama_mapel,
        s.nama_lengkap AS nama_siswa
      FROM jadwal j
      JOIN mapel m ON j.mapel_id = m.id
      JOIN siswa s ON j.kelas_id = s.kelas_id
      WHERE s.orang_tua_id = $1 AND UPPER(j.hari) = $2
      ORDER BY j.jam_mulai ASC
    `, [orangTuaId, hariIni]);

    res.json(result.rows);
  } catch (err) {
    console.error('Gagal ambil jadwal hari ini anak:', err);
    res.status(500).json({ error: 'Gagal ambil jadwal hari ini anak' });
  }
};

const getJadwalMingguanAnak = async (req, res) => {
  try {
    const orangTuaId = req.user.id; // ✅ GANTI INI

    const siswaResult = await db.query( // ✅ kamu pakai `db`, bukan `pool`
      `SELECT id, kelas_id FROM siswa WHERE orang_tua_id = $1 LIMIT 1`,
      [orangTuaId]
    );

    if (siswaResult.rows.length === 0) {
      return res.status(404).json({ message: "Data anak tidak ditemukan" });
    }

    const siswa = siswaResult.rows[0];

    const jadwalResult = await db.query(
      `SELECT j.hari, j.jam_mulai, j.jam_selesai, m.nama_mapel, g.nama_lengkap AS nama_guru
      FROM jadwal j
      JOIN mapel m ON j.mapel_id = m.id
      JOIN guru g ON j.guru_id = g.id
      WHERE j.kelas_id = $1
      ORDER BY 
        CASE 
          WHEN j.hari = 'Senin' THEN 1
          WHEN j.hari = 'Selasa' THEN 2
          WHEN j.hari = 'Rabu' THEN 3
          WHEN j.hari = 'Kamis' THEN 4
          WHEN j.hari = 'Jumat' THEN 5
          ELSE 6
        END,
        j.jam_mulai`,
      [siswa.kelas_id]
    );

    res.json(jadwalResult.rows);
  } catch (error) {
    console.error("Gagal mengambil jadwal mingguan anak:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil jadwal anak" });
  }
};

const getNilaiAnakByMapel = async (req, res) => {
  const orangTuaId = req.user.id;
  const { mapelId } = req.params;

  try {
    // cari siswa berdasarkan orang tua
    const siswaResult = await db.query(
      `SELECT id FROM siswa WHERE orang_tua_id = $1 LIMIT 1`,
      [orangTuaId]
    );

    if (siswaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Data anak tidak ditemukan' });
    }

    const siswaId = siswaResult.rows[0].id;

    // Ambil nilai Tugas
    const tugasResult = await db.query(
      `SELECT t.judul, t.tanggal_deadline, ns.nilai
       FROM nilai ns
       JOIN tugas t ON ns.tugas_id = t.id
       WHERE ns.siswa_id = $1 AND ns.mapel_id = $2`,
      [siswaId, mapelId]
    );

    // Ambil nilai UTS/UAS
    const ujianResult = await db.query(
      `SELECT kategori, nilai
       FROM nilai
       WHERE siswa_id = $1 AND mapel_id = $2 AND kategori IN ('UTS', 'UAS')`,
      [siswaId, mapelId]
    );

    res.json({
      tugas: tugasResult.rows,
      ujian: ujianResult.rows,
    });
  } catch (err) {
    console.error('Gagal mengambil nilai anak:', err);
    res.status(500).json({ error: 'Gagal mengambil nilai anak' });
  }
};

const pool = require("../db");

const getPresensiAnakByBulan = async (req, res) => {
  const orangTuaId = req.user.id;
  const bulan = parseInt(req.query.bulan); // bulan 1–12

  if (!bulan || bulan < 1 || bulan > 12) {
    return res.status(400).json({ error: "Parameter bulan tidak valid" });
  }

  try {
    // Ambil ID siswa dari orang tua
    const { rows: siswaRows } = await pool.query(
      "SELECT id FROM siswa WHERE orang_tua_id = $1",
      [orangTuaId]
    );

    if (siswaRows.length === 0) {
      return res.status(404).json({ error: "Data siswa tidak ditemukan" });
    }

    const siswaId = siswaRows[0].id;

    // Ambil presensi anak berdasarkan bulan
    const { rows: presensiRows } = await pool.query(
      `
      SELECT * FROM absensi
      WHERE siswa_id = $1 AND EXTRACT(MONTH FROM tanggal) = $2
      ORDER BY tanggal ASC
      `,
      [siswaId, bulan]
    );

    res.json(presensiRows);
  } catch (error) {
    console.error("Gagal mengambil data presensi anak:", error);
    res.status(500).json({ error: "Gagal mengambil data presensi anak" });
  }
};

module.exports = {
  getPresensiAnakByBulan,
};


module.exports = {
  getAllOrangTua,
  getOrangTuaById,
  addOrangTua,
  updateOrangTua,
  deleteOrangTua,
  loginOrangTua,
  getProfileOrangTua,
  getTugasAnak,
  getJadwalHariIniAnak,
  getJadwalMingguanAnak,
  getNilaiAnakByMapel,
  getPresensiAnakByBulan,
};
