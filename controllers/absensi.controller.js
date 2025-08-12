const db = require("../db");

// 🔍 Ambil semua absensi
const getAllAbsensi = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM absensi ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil absensi:", err);
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
    console.error("Error ambil absensi by ID:", err);
    res.status(500).json({ error: "Gagal ambil absensi" });
  }
};

// ➕ Tambah absensi tunggal
const addAbsensi = async (req, res) => {
  const { siswa_id, jadwal_id, tanggal, status } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO absensi (siswa_id, jadwal_id, tanggal, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [siswa_id, jadwal_id, tanggal, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah absensi:", err);
    res.status(500).json({ error: "Gagal tambah absensi" });
  }
};

// ✏️ Update absensi
const updateAbsensi = async (req, res) => {
  const { id } = req.params;
  const { siswa_id, jadwal_id, tanggal, status } = req.body;
  try {
    const result = await db.query(
      `UPDATE absensi SET siswa_id = $1, jadwal_id = $2, tanggal = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [siswa_id, jadwal_id, tanggal, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absensi tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update absensi:", err);
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
    console.error("Error hapus absensi:", err);
    res.status(500).json({ error: "Gagal hapus absensi" });
  }
};

// ➕ Tambah banyak absensi sekaligus
const addAbsensiBulk = async (req, res) => {
  const absensiList = req.body;

  if (!Array.isArray(absensiList)) {
    return res.status(400).json({ error: "Data harus berupa array" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    for (const absensi of absensiList) {
      const { siswa_id, jadwal_id, tanggal, status } = absensi;

      if (!siswa_id || !jadwal_id || !tanggal || !status) {
        console.warn("❌ Data tidak lengkap:", absensi);
        continue; // Skip data tidak valid
      }

      await client.query(
        `INSERT INTO absensi (siswa_id, jadwal_id, tanggal, status)
         VALUES ($1, $2, $3, $4)`,
        [siswa_id, jadwal_id, tanggal, status]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Semua absensi berhasil ditambahkan" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error bulk tambah absensi:", err);
    res.status(500).json({ error: "Gagal tambah data absensi" });
  } finally {
    client.release();
  }
};

// 🔍 Ambil siswa berdasarkan kelas
const getSiswaByKelas = async (req, res) => {
  const { kelas_id } = req.params;
  try {
    const result = await db.query(
      `SELECT id, nama_lengkap FROM siswa WHERE kelas_id = $1 ORDER BY nama_lengkap`,
      [kelas_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil siswa by kelas:", err);
    res.status(500).json({ error: "Gagal ambil siswa" });
  }
};

// 📊 Rekap absensi per siswa dalam satu kelas
const getRekapAbsensiByKelas = async (req, res) => {
  const { kelas_id } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        s.id AS siswa_id,
        s.nama_lengkap,
        COUNT(*) FILTER (WHERE a.status = 'Hadir') AS hadir,
        COUNT(*) FILTER (WHERE a.status = 'Izin') AS izin,
        COUNT(*) FILTER (WHERE a.status = 'Sakit') AS sakit,
        COUNT(*) FILTER (WHERE a.status = 'Alpha') AS alpha
      FROM siswa s
      LEFT JOIN absensi a ON a.siswa_id = s.id
      WHERE s.kelas_id = $1
      GROUP BY s.id
      ORDER BY s.nama_lengkap
    `, [kelas_id]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error rekap absensi:", err);
    res.status(500).json({ error: "Gagal rekap absensi" });
  }
};

// 📊 Ambil absensi guru berdasarkan nama dan rentang waktu
const getAbsensiGuruByNama = async (req, res) => {
  const { nama, start, end } = req.query;

  if (!nama || !start || !end) {
    return res.status(400).json({ error: "Nama, start, dan end harus disertakan" });
  }

  try {
    const result = await db.query(`
      SELECT ag.tanggal, ag.status, ag.keterangan, g.nama_lengkap
      FROM absensi_guru ag
      JOIN guru g ON ag.guru_id = g.id
      WHERE g.nama_lengkap ILIKE $1
        AND ag.tanggal BETWEEN $2 AND $3
      ORDER BY ag.tanggal ASC
    `, [`%${nama}%`, start, end]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil absensi guru:", err);
    res.status(500).json({ error: "Gagal ambil absensi guru" });
  }
};

// 📊 Rekap kehadiran siswa per tanggal berdasarkan kelas dan bulan
const getRekapAbsensiSiswa = async (req, res) => {
  const { kelas_id, bulan } = req.query;

  if (!kelas_id || !bulan) {
    return res.status(400).json({ error: "kelas_id dan bulan diperlukan" });
  }

  try {
    const result = await db.query(`
      SELECT 
        tanggal::date,
        COUNT(*) FILTER (WHERE status = 'Hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'Izin') AS izin,
        COUNT(*) FILTER (WHERE status = 'Alpha' OR status = 'Sakit') AS tidak_hadir 
      FROM absensi a
      JOIN siswa s ON a.siswa_id = s.id
      WHERE s.kelas_id = $1
        AND TO_CHAR(tanggal, 'YYYY-MM') = $2
      GROUP BY tanggal
      ORDER BY tanggal ASC
    `, [kelas_id, bulan]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error rekap absensi siswa:", err);
    res.status(500).json({ error: "Gagal ambil rekap absensi siswa" });
  }
};

// 📊 Statistik total kehadiran siswa untuk dashboard (gabungan semua siswa)
const getStatistikSiswa = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'Izin') AS izin,
        COUNT(*) FILTER (WHERE status = 'Sakit' OR status = 'Alpha') AS tidak_hadir
      FROM absensi
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil statistik siswa:", err);
    res.status(500).json({ error: "Gagal ambil statistik siswa" });
  }
};

// 📊 Statistik total kehadiran guru untuk dashboard (gabungan semua guru)
const getStatistikGuru = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Hadir') AS hadir,
        COUNT(*) FILTER (WHERE status = 'Izin') AS izin,
        COUNT(*) FILTER (WHERE status = 'Sakit' OR status = 'Alpha') AS tidak_hadir
      FROM absensi_guru
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil statistik guru:", err);
    res.status(500).json({ error: "Gagal ambil statistik guru" });
  }
};


module.exports = {
  getAllAbsensi,
  getAbsensiById,
  addAbsensi,
  updateAbsensi,
  deleteAbsensi,
  addAbsensiBulk,
  getSiswaByKelas,
  getRekapAbsensiByKelas,
  getAbsensiGuruByNama,
  getRekapAbsensiSiswa,
  getStatistikSiswa,
  getStatistikGuru,
};
