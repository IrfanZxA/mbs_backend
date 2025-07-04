const db = require("../db");

// 🔍 Ambil semua data siswa
const getAllSiswa = async (req, res) => {
  const { nama, kelas_id } = req.query;

  try {
    let query = `
      SELECT s.*, k.nama_kelas, 
             o.nama_lengkap AS orang_tua_nama,
             o.alamat AS alamat, 
             o.no_hp AS no_hp
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN orang_tua o ON s.orang_tua_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (nama) {
      params.push(`%${nama}%`);
      query += ` AND s.nama_lengkap ILIKE $${params.length}`;
    }

    if (kelas_id) {
      params.push(kelas_id);
      query += ` AND s.kelas_id = $${params.length}`;
    }

    query += ` ORDER BY s.nama_lengkap ASC`;

    const result = await db.query(query, params);
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
    nama_lengkap,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    kelas_id,
    orang_tua,
    alamat,
    no_hp,
  } = req.body;

  try {
    // Ambil siswa dulu buat dapat orang_tua_id
    const siswaResult = await db.query("SELECT orang_tua_id FROM siswa WHERE id = $1", [id]);
    if (siswaResult.rows.length === 0) {
      return res.status(404).json({ error: "Siswa tidak ditemukan" });
    }
    const orangTuaId = siswaResult.rows[0].orang_tua_id;

    // Update siswa
    await db.query(
      `UPDATE siswa SET
        nama_lengkap = $1,
        tempat_lahir = $2,
        tanggal_lahir = $3,
        jenis_kelamin = $4,
        kelas_id = $5
      WHERE id = $6`,
      [nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, kelas_id, id]
    );

    // Update data orang tua
    await db.query(
      `UPDATE orang_tua SET
        nama_lengkap = $1,
        alamat = $2,
        no_hp = $3
      WHERE id = $4`,
      [orang_tua, alamat, no_hp, orangTuaId]
    );

    res.json({ message: "Data siswa dan orang tua berhasil diperbarui" });
  } catch (err) {
    console.error("Error update siswa + ortu", err);
    res.status(500).json({ error: "Gagal update data siswa dan orang tua" });
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

// 🔍 Ambil presensi siswa berdasarkan semester & bulan
const getPresensiSiswa = async (req, res) => {
  const siswaId = req.user.id;
  const bulan = parseInt(req.query.bulan);       // 1-12
  const semester = parseInt(req.query.semester); // 1 atau 2

  try {
    // Validasi semester dan bulan
    if (
      (semester === 1 && (bulan < 7 || bulan > 12)) ||
      (semester === 2 && (bulan < 1 || bulan > 6))
    ) {
      return res.status(400).json({ error: 'Bulan tidak sesuai dengan semester' });
    }

    const result = await db.query(
      `SELECT tanggal, status
       FROM absensi
       WHERE siswa_id = $1 AND EXTRACT(MONTH FROM tanggal) = $2
       ORDER BY tanggal ASC`,
      [siswaId, bulan]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Gagal ambil presensi siswa:', err);
    res.status(500).json({ error: 'Gagal ambil data presensi' });
  }
};

// controllers/siswa.controller.js
const ajukanIzin = async (req, res) => {
  const siswaId = req.user.id;
  const { tanggal_mulai, tanggal_selesai, keterangan } = req.body;

  if (!tanggal_mulai || !tanggal_selesai || !keterangan) {
    return res.status(400).json({ error: "Lengkapi semua data!" });
  }

  const tglMulai = new Date(tanggal_mulai);
  const tglSelesai = new Date(tanggal_selesai);

  try {
    for (
      let d = new Date(tglMulai);
      d <= tglSelesai;
      d.setDate(d.getDate() + 1)
    ) {
      const tanggalFormatted = d.toISOString().split("T")[0]; // YYYY-MM-DD

 await db.query(
  `INSERT INTO absensi (siswa_id, jadwal_id, tanggal, status, keterangan)
   VALUES ($1, $2, $3, $4, $5)
   ON CONFLICT (siswa_id, tanggal) DO UPDATE
   SET status = EXCLUDED.status,
       keterangan = EXCLUDED.keterangan`
, [siswaId, null, tanggalFormatted, 'Izin', keterangan]
      );
    }

    res.json({ message: "Pengajuan izin berhasil disimpan!" });
  } catch (err) {
    console.error("Gagal ajukan izin:", err);
    res.status(500).json({ error: "Gagal ajukan izin!" });
  }
};


// 🔼 Tambah materi (upload file)
const addMateri = async (req, res) => {
  const guru_id = req.user.id; // ✅ Ambil dari token guru
  const { jadwal_id, judul, deskripsi } = req.body;
  const file_url = req.file?.path;
  const tanggal_upload = new Date();

  try {
    const result = await db.query(
      `INSERT INTO materi (
        guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah materi", err);
    res.status(500).json({ error: "Gagal tambah materi" });
  }
};

// 🔍 Ambil semua materi
const getAllMateri = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM materi ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil materi", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

// 🔍 Ambil materi berdasarkan ID
const getMateriById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM materi WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil materi by ID", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

// ✏️ Edit materi
const updateMateri = async (req, res) => {
  const { id } = req.params;
  const { guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload } = req.body;

  try {
    const result = await db.query(
      `UPDATE materi SET 
        guru_id = $1,
        jadwal_id = $2,
        judul = $3,
        deskripsi = $4,
        file_url = $5,
        tanggal_upload = $6
      WHERE id = $7 RETURNING *`,
      [guru_id, jadwal_id, judul, deskripsi, file_url, tanggal_upload, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update materi", err);
    res.status(500).json({ error: "Gagal update materi" });
  }
};

// ❌ Hapus materi
const deleteMateri = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM materi WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Materi tidak ditemukan" });

    res.json({ message: "Materi berhasil dihapus", materi: result.rows[0] });
  } catch (err) {
    console.error("Error hapus materi", err);
    res.status(500).json({ error: "Gagal hapus materi" });
  }
};


const getMateriSiswa = async (req, res) => {
  const siswaId = req.user.id;

  try {
    // Ambil kelas siswa
    const siswaResult = await db.query("SELECT kelas_id FROM siswa WHERE id = $1", [siswaId]);
    const kelasId = siswaResult.rows[0]?.kelas_id;

    if (!kelasId) return res.status(404).json({ error: "Kelas tidak ditemukan" });

    // Ambil semua materi yang berkaitan dengan kelas (melalui jadwal)
    const result = await db.query(`
      SELECT m.*, mapel.nama_mapel, mapel.kode_mapel
      FROM materi m
      JOIN jadwal j ON m.jadwal_id = j.id
      JOIN mapel ON j.mapel_id = mapel.id
      WHERE j.kelas_id = $1
      ORDER BY m.tanggal_upload DESC
    `, [kelasId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Gagal ambil materi siswa:", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

const getMateriByKodeMapel = async (req, res) => {
  const siswaId = req.user.id;
  const { kode_mapel } = req.params;

  try {
    const siswaResult = await db.query("SELECT kelas_id FROM siswa WHERE id = $1", [siswaId]);
    const kelasId = siswaResult.rows[0]?.kelas_id;

    if (!kelasId) return res.status(404).json({ error: "Kelas tidak ditemukan" });

    const result = await db.query(`
      SELECT m.*, mapel.nama_mapel, mapel.kode_mapel
      FROM materi m
      JOIN jadwal j ON m.jadwal_id = j.id
      JOIN mapel ON j.mapel_id = mapel.id
      WHERE j.kelas_id = $1 AND mapel.kode_mapel = $2
      ORDER BY m.tanggal_upload DESC
    `, [kelasId, kode_mapel]);

    res.json(result.rows);
  } catch (err) {
    console.error("Gagal ambil materi berdasarkan kode_mapel:", err);
    res.status(500).json({ error: "Gagal ambil materi" });
  }
};

const getDetailMateri = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT m.*, g.nama_lengkap AS nama_guru, mp.nama_mapel
      FROM materi m
      LEFT JOIN jadwal j ON m.jadwal_id = j.id
      LEFT JOIN guru g ON j.guru_id = g.id
      LEFT JOIN mapel mp ON j.mapel_id = mp.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Gagal ambil detail materi:", err);
    res.status(500).json({ error: "Gagal ambil detail materi" });
  }
};


module.exports = {
  addMateri,
  getAllMateri,
  getMateriById,
  updateMateri,
  deleteMateri,
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
  getPresensiSiswa,
  ajukanIzin,
  getMateriSiswa,
  getMateriByKodeMapel,
  getDetailMateri,
};
