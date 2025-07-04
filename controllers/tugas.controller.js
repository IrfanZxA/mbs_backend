const path = require('path');
const db = require('../db');

// Ambil tugas untuk siswa berdasarkan kelasnya
const getTugasSiswa = async (req, res) => {
  const siswaId = req.user.id;

  try {
    // Ambil kelas siswa
    const siswaResult = await db.query('SELECT kelas_id FROM siswa WHERE id = $1', [siswaId]);
    if (siswaResult.rows.length === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' });

    const kelasId = siswaResult.rows[0].kelas_id;

    // Ambil tugas berdasarkan jadwal di kelas siswa
    const tugasResult = await db.query(`
      SELECT t.id, t.judul, t.tanggal_deadline, m.nama_mapel
      FROM tugas t
      JOIN jadwal j ON t.jadwal_id = j.id
      JOIN mapel m ON j.mapel_id = m.id
      WHERE j.kelas_id = $1
      ORDER BY t.tanggal_deadline ASC
    `, [kelasId]);

    res.json(tugasResult.rows);
  } catch (err) {
    console.error('Gagal mengambil daftar tugas:', err);
    res.status(500).json({ error: 'Gagal mengambil tugas siswa' });
  }
};

const getTugasByGuru = async (req, res) => {
  const guruId = req.user.id;

  try {
    const result = await db.query(
      `SELECT t.id, t.judul, t.tanggal_deadline, j.kelas_id
       FROM tugas t
       JOIN jadwal j ON t.jadwal_id = j.id
       WHERE t.guru_id = $1`,
      [guruId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Gagal ambil tugas guru", err);
    res.status(500).json({ error: "Gagal ambil tugas guru" });
  }
};

const addTugas = async (req, res) => {
  const guruId = req.user.id;
  const { judul, deskripsi, poin, kelas_id, tenggat } = req.body;
  const file = req.file;

  try {
    // Ambil jadwal_id yang cocok dengan guru dan kelas
    const jadwalRes = await db.query(
      'SELECT id FROM jadwal WHERE guru_id = $1 AND kelas_id = $2 LIMIT 1',
      [guruId, kelas_id]
    );

    if (jadwalRes.rows.length === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan untuk guru dan kelas tersebut' });
    }

    const jadwalId = jadwalRes.rows[0].id;
    const fileUrl = file ? `/uploads/${file.filename}` : null;

    await db.query(
      `INSERT INTO tugas (guru_id, jadwal_id, judul, deskripsi, tanggal_deadline, file_url, tanggal_dibuat)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [guruId, jadwalId, judul, deskripsi, tenggat, fileUrl]
    );

    res.status(201).json({ message: 'Tugas berhasil ditambahkan' });
  } catch (err) {
    console.error('Gagal tambah tugas:', err);
    res.status(500).json({ error: 'Gagal tambah tugas' });
  }
};

module.exports = {
  getTugasSiswa,
  getTugasByGuru,
  addTugas,
};
