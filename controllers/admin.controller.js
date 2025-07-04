const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 Login Admin
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM admin WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Username tidak ditemukan" });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Password salah" });
    }

const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, {
  expiresIn: "1d",
});

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nama_lengkap: admin.nama_lengkap, // ✅ ditambahkan
      },
    });
  } catch (err) {
    console.error("Login admin gagal:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const { id } = req.admin;

    const result = await db.query(
      "SELECT id, username, nama_lengkap FROM admin WHERE id = $1", // ✅ ditambahkan
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin tidak ditemukan" });
    }

    res.json({ admin: result.rows[0] });
  } catch (err) {
    console.error("Gagal ambil profil admin:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🚫 Nonaktifkan akun siswa
const nonaktifkanSiswa = async (req, res) => {
  const siswaId = req.params.id;
  const { alasan, tanggal } = req.body;

  try {
    const result = await db.query(
      "UPDATE siswa SET aktif = FALSE WHERE id = $1 RETURNING *",
      [siswaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }

    // 📝 (Opsional) Simpan alasan & tanggal ke log penonaktifan
    // await db.query("INSERT INTO log_penonaktifan (siswa_id, alasan, tanggal) VALUES ($1, $2, $3)", [siswaId, alasan, tanggal]);

    res.json({ message: "Akun siswa berhasil dinonaktifkan", siswa: result.rows[0] });
  } catch (err) {
    console.error("Gagal nonaktifkan siswa:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menonaktifkan akun siswa" });
  }
};

// ➕ Tambah guru dan jadwal sekaligus
const addGuruWithJadwal = async (req, res) => {
  const {
    nama_lengkap, nip, username, password,
    tempat_lahir, tanggal_lahir, jenis_kelamin,
    no_hp, alamat, mapel_id, jadwal
  } = req.body;

  try {
    // 🔐 Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 💾 Simpan ke tabel guru
const created_at = new Date();

const guruResult = await db.query(`
  INSERT INTO guru (
    nama_lengkap, nip, username, password_hash,
    tempat_lahir, tanggal_lahir, jenis_kelamin,
    no_hp, alamat, mapel_id, created_at
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING id
`, [
  nama_lengkap, nip, username, password_hash,
  tempat_lahir, tanggal_lahir, jenis_kelamin,
  no_hp, alamat, mapel_id, created_at
]);

    const guruId = guruResult.rows[0].id;

    // ⏰ Simpan semua jadwal ke tabel jadwal
    for (const j of jadwal) {
      await db.query(`
        INSERT INTO jadwal (guru_id, kelas_id, mapel_id, hari, jam_mulai, jam_selesai)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        guruId, j.kelas_id, j.mapel_id, j.hari, j.jam_mulai, j.jam_selesai
      ]);
    }

    res.status(201).json({ message: 'Guru dan jadwal berhasil ditambahkan' });
  } catch (err) {
    console.error("Gagal tambah guru:", err);
    res.status(500).json({ error: "Gagal tambah guru" });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  nonaktifkanSiswa,
  addGuruWithJadwal,
};
