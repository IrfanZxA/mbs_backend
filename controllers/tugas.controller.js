// controllers/tugas.controller.js
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

module.exports = {
  getTugasSiswa
};
