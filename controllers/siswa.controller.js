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

const addSiswa = async (req, res) => {
  const bcrypt = require("bcrypt");
  const {
    username,
    password_hash,
    nama_lengkap,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    kelas_id,
    nama_ortu,
    nik,
    alamat,
    no_hp,
  } = req.body;

  try {
    // ✅ Validasi minimal
    if (!nama_ortu || !no_hp || !alamat) {
      return res.status(400).json({ error: "Nama orang tua, nomor HP, dan alamat wajib diisi" });
    }

    // 🔐 Hash password siswa
    const hashedPassword = await bcrypt.hash(password_hash, 12);

    // 🔐 Hash password orang tua (pakai username sebagai password default)
    const hashedOrtuPassword = await bcrypt.hash(username, 12);

    // 👨‍👩‍👧 Tambahkan data orang tua terlebih dahulu
    const resultOrtu = await db.query(
      `INSERT INTO orang_tua (
        username, password_hash, nama_lengkap, nik, alamat, no_hp, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [
        `ortu_${username}`, // username ortu
        hashedOrtuPassword,
        nama_ortu,
        nik, // dummy NIK
        alamat,
        no_hp
      ]
    );

    const orang_tua_id = resultOrtu.rows[0].id;

    // 👦 Tambahkan siswa
    const resultSiswa = await db.query(
      `INSERT INTO siswa (
        username, password_hash, orang_tua_id,
        nama_lengkap, tempat_lahir, tanggal_lahir,
        jenis_kelamin, kelas_id, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
      [
        username,
        hashedPassword,
        orang_tua_id,
        nama_lengkap,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        kelas_id
      ]
    );

    res.status(201).json(resultSiswa.rows[0]);
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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login siswa
const loginSiswa = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM siswa WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Username tidak ditemukan" });
    }

    const siswa = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, siswa.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

    const token = jwt.sign({
  id: siswa.id,
  kelas_id: siswa.kelas_id, // ⬅ Tambahkan ini
}, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      siswa: {
        id: siswa.id,
        nama: siswa.nama_lengkap,
        username: siswa.username,
      },
    });
  } catch (err) {
    console.error("Login siswa gagal:", err);
    res.status(500).json({ error: "Login gagal" });
  }
};

// Ambil profil siswa dari token
const getProfileSiswa = async (req, res) => {
 const siswaId = req.user.id; 

  try {
    const result = await db.query("SELECT id, username, nama_lengkap FROM siswa WHERE id = $1", [siswaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }

    res.json({ siswa: result.rows[0] });
  } catch (err) {
    console.error("Error ambil profil siswa", err);
    res.status(500).json({ error: "Gagal ambil profil siswa" });
  }
};

const getTugasSiswa = async (req, res) => {
  const siswaId = req.user.id; 
  try {
    const result = await db.query(`
      SELECT t.id, t.judul, t.tanggal_deadline, m.nama_mapel
      FROM tugas t
      JOIN jadwal j ON t.jadwal_id = j.id
      JOIN mapel m ON j.mapel_id = m.id
      JOIN siswa s ON s.kelas_id = j.kelas_id
      WHERE s.id = $1
      ORDER BY t.tanggal_deadline ASC
    `, [siswaId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error ambil tugas:", error);
    res.status(500).json({ message: "Gagal mengambil data tugas" });
  }
};

const getJadwalHariIni = async (req, res) => {
  const siswaId = req.user.id;
  const hariIni = new Date().toLocaleDateString("id-ID", { weekday: 'long' });

  try {
    // Ambil kelas_id siswa
    const siswaResult = await db.query("SELECT kelas_id FROM siswa WHERE id = $1", [siswaId]);
    if (siswaResult.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }

    const kelasId = siswaResult.rows[0].kelas_id;

    // Ambil jadwal hari ini berdasarkan kelas
    const jadwalResult = await db.query(`
      SELECT j.id, m.nama_mapel, j.jam_mulai, j.jam_selesai 
      FROM jadwal j
      JOIN mapel m ON j.mapel_id = m.id
      WHERE j.kelas_id = $1 AND LOWER(j.hari) = LOWER($2)
      ORDER BY j.jam_mulai ASC
    `, [kelasId, hariIni]);

    res.json(jadwalResult.rows);
  } catch (error) {
    console.error("Error ambil jadwal hari ini:", error);
    res.status(500).json({ error: "Gagal mengambil jadwal hari ini" });
  }
};

  const getJadwalMingguan = async (req, res) => {
    try {
      console.log("🧾 Token Decode:", req.user);
      const kelasId = req.user.kelas_id; // Ambil dari token JWT

      const result = await db.query(`
        SELECT j.id, j.hari, j.jam_mulai, j.jam_selesai,
              m.nama_mapel, g.nama_lengkap AS nama_guru
        FROM jadwal j
        JOIN mapel m ON j.mapel_id = m.id
        JOIN guru g ON j.guru_id = g.id
        WHERE j.kelas_id = $1
      `, [kelasId]); // ⬅ PARAMETER DIBERIKAN DI SINI

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mengambil jadwal mingguan" });
    }
  };

  // 🔍 Cek ketersediaan username
const cekUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await db.query("SELECT id FROM siswa WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (err) {
    console.error("Error cek username", err);
    res.status(500).json({ error: "Gagal mengecek username" });
  }
};

module.exports = {
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
  loginSiswa,
  getProfileSiswa,
  getTugasSiswa,
  getJadwalHariIni,
  getJadwalMingguan,
  cekUsername,
};
