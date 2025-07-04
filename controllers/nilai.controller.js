const db = require("../db");

// 🔍 Ambil semua nilai
const getAllNilai = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM nilai ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil nilai", err);
    res.status(500).json({ error: "Gagal ambil nilai" });
  }
};

// 🔍 Ambil nilai berdasarkan ID
const getNilaiById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM nilai WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil nilai by ID", err);
    res.status(500).json({ error: "Gagal ambil nilai" });
  }
};

// ➕ Tambah nilai
const addNilai = async (req, res) => {
  const { siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, tugas_id } = req.body;
  try {
    let query;
    let values;

    if (kategori === "Tugas") {
      query = `
        INSERT INTO nilai (
          siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, tugas_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
      values = [siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, tugas_id];
    } else {
      query = `
        INSERT INTO nilai (
          siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
      values = [siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id];
    }

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error tambah nilai:", err);
    res.status(500).json({ error: "Gagal tambah nilai" });
  }
};

// ✏️ Update nilai
const updateNilai = async (req, res) => {
  const { id } = req.params;
  const { siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, tugas_id } = req.body;

  try {
    let query;
    let values;

    if (kategori === "Tugas") {
      query = `
        UPDATE nilai SET
          siswa_id = $1,
          mapel_id = $2,
          kategori = $3,
          nilai = $4,
          tanggal = $5,
          kelas_id = $6,
          tugas_id = $7
        WHERE id = $8 RETURNING *`;
      values = [siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, tugas_id, id];
    } else {
      query = `
        UPDATE nilai SET
          siswa_id = $1,
          mapel_id = $2,
          kategori = $3,
          nilai = $4,
          tanggal = $5,
          kelas_id = $6,
          tugas_id = NULL
        WHERE id = $7 RETURNING *`;
      values = [siswa_id, mapel_id, kategori, nilai, tanggal, kelas_id, id];
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update nilai", err);
    res.status(500).json({ error: "Gagal update nilai" });
  }
};

// ❌ Hapus nilai
const deleteNilai = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM nilai WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nilai tidak ditemukan" });
    }
    res.json({ message: "Nilai berhasil dihapus", nilai: result.rows[0] });
  } catch (err) {
    console.error("Error hapus nilai", err);
    res.status(500).json({ error: "Gagal hapus nilai" });
  }
};

// 🔍 Rekap nilai per kelas
const getRekapNilaiByKelas = async (req, res) => {
  const { kelasId } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        s.id AS siswa_id,
        s.nama_lengkap,
        ROUND(AVG(CASE WHEN n.kategori = 'Tugas' THEN n.nilai ELSE NULL END)) AS tugas,
        MAX(CASE WHEN n.kategori = 'UTS' THEN n.nilai ELSE NULL END) AS uts,
        MAX(CASE WHEN n.kategori = 'UAS' THEN n.nilai ELSE NULL END) AS uas
      FROM siswa s
      LEFT JOIN nilai n ON s.id = n.siswa_id AND n.kelas_id = $1
      WHERE s.kelas_id = $1
      GROUP BY s.id, s.nama_lengkap
      ORDER BY s.nama_lengkap ASC
    `, [kelasId]);

    const rekap = result.rows.map(row => {
      const nilaiTugas = row.tugas || 0;
      const nilaiUTS = row.uts || 0;
      const nilaiUAS = row.uas || 0;
      const rataRata = Math.round((nilaiTugas + nilaiUTS + nilaiUAS) / 3);

      return {
        ...row,
        rata_rata: rataRata
      };
    });

    res.json(rekap);
  } catch (err) {
    console.error("❌ Error ambil rekap nilai:", err);
    res.status(500).json({ error: "Gagal ambil rekap nilai" });
  }
};

// 🔍 Ambil nilai siswa berdasarkan mapel tertentu
const getNilaiSiswaByMapel = async (req, res) => {
  const siswaId = req.user.id;
  const { mapelId } = req.params;

  try {
    const tugasQuery = await db.query(`
      SELECT t.judul, t.tanggal_deadline, n.nilai
      FROM nilai n
      JOIN tugas t ON n.tugas_id = t.id
      WHERE n.siswa_id = $1 AND n.mapel_id = $2 AND n.kategori = 'Tugas'
    `, [siswaId, mapelId]);

    const ujianQuery = await db.query(`
      SELECT kategori, nilai
      FROM nilai
      WHERE siswa_id = $1 AND mapel_id = $2 AND kategori IN ('UTS', 'UAS')
    `, [siswaId, mapelId]);

    res.json({
      tugas: tugasQuery.rows,
      ujian: ujianQuery.rows,
    });
  } catch (err) {
    console.error("❌ Error ambil nilai siswa per mapel:", err);
    res.status(500).json({ error: "Gagal ambil nilai siswa" });
  }
};

const getRekapNilaiByKelasSemester = async (req, res) => {
  const { kelas, semester } = req.query;

  try {
    const result = await db.query(`
      SELECT 
        s.id AS siswa_id,
        s.nama_lengkap,
        ROUND(AVG(CASE WHEN n.kategori = 'Tugas' THEN n.nilai ELSE NULL END)) AS tugas,
        MAX(CASE WHEN n.kategori = 'UTS' THEN n.nilai ELSE NULL END) AS uts,
        MAX(CASE WHEN n.kategori = 'UAS' THEN n.nilai ELSE NULL END) AS uas
      FROM siswa s
      LEFT JOIN nilai n ON s.id = n.siswa_id
        AND n.kelas_id = (SELECT id FROM kelas WHERE nama_kelas = $1)
        AND n.semester = $2
      WHERE s.kelas_id = (SELECT id FROM kelas WHERE nama_kelas = $1)
      GROUP BY s.id, s.nama_lengkap
      ORDER BY s.nama_lengkap ASC
    `, [kelas, semester]);

    const rekap = result.rows.map(row => {
      const nilaiTugas = row.tugas || 0;
      const nilaiUTS = row.uts || 0;
      const nilaiUAS = row.uas || 0;
      const rataRata = Math.round((nilaiTugas + nilaiUTS + nilaiUAS) / 3);

      return {
        ...row,
        rata_rata: rataRata
      };
    });

    res.json(rekap);
  } catch (err) {
    console.error("❌ Error ambil rekap nilai semester:", err);
    res.status(500).json({ error: "Gagal ambil rekap nilai" });
  }
};

const getLaporanNilaiMapel = async (req, res) => {
  const { kelas, mapel, semester } = req.query;

  try {
    const result = await db.query(`
      SELECT 
        s.id AS siswa_id,
        s.nama_lengkap,
        ROUND(AVG(CASE WHEN n.kategori = 'Tugas' THEN n.nilai ELSE NULL END)) AS tugas,
        MAX(CASE WHEN n.kategori = 'UTS' THEN n.nilai ELSE NULL END) AS uts,
        MAX(CASE WHEN n.kategori = 'UAS' THEN n.nilai ELSE NULL END) AS uas
      FROM siswa s
      LEFT JOIN nilai n ON s.id = n.siswa_id
        AND n.kelas_id = (SELECT id FROM kelas WHERE nama_kelas = $1)
        AND n.mapel_id = (SELECT id FROM mapel WHERE nama_mapel = $2)
        AND n.semester = $3
      WHERE s.kelas_id = (SELECT id FROM kelas WHERE nama_kelas = $1)
      GROUP BY s.id, s.nama_lengkap
      ORDER BY s.nama_lengkap ASC
    `, [kelas, mapel, semester]);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error ambil laporan nilai mapel:", err);
    res.status(500).json({ error: "Gagal ambil laporan nilai mapel" });
  }
};

module.exports = {
  getAllNilai,
  getNilaiById,
  addNilai,
  updateNilai,
  deleteNilai,
  getRekapNilaiByKelas,
  getNilaiSiswaByMapel,
  getRekapNilaiByKelasSemester,
  getLaporanNilaiMapel,
};
