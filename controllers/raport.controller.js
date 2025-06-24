const db = require("../db");

// 🔍 Ambil semua raport
const getAllRaport = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM raport ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error ambil raport", err);
    res.status(500).json({ error: "Gagal ambil data raport" });
  }
};

// 🔍 Ambil raport berdasarkan ID
const getRaportById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM raport WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Raport tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error ambil raport by ID", err);
    res.status(500).json({ error: "Gagal ambil raport" });
  }
};

// ➕ Tambah raport
const addRaport = async (req, res) => {
  const {
    siswa_id,
    kelas_id,
    mapel_id,
    semester,
    tahun_ajaran,
    nilai_akhir,
    keterangan,
    file_url,
    tanggal_terbit,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO raport (
        siswa_id, kelas_id, mapel_id, semester,
        tahun_ajaran, nilai_akhir, keterangan,
        file_url, tanggal_terbit
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        siswa_id, kelas_id, mapel_id, semester,
        tahun_ajaran, nilai_akhir, keterangan,
        file_url, tanggal_terbit
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error tambah raport", err);
    res.status(500).json({ error: "Gagal tambah raport" });
  }
};

// ✏️ Update raport
const updateRaport = async (req, res) => {
  const { id } = req.params;
  const {
    siswa_id,
    kelas_id,
    mapel_id,
    semester,
    tahun_ajaran,
    nilai_akhir,
    keterangan,
    file_url,
    tanggal_terbit,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE raport SET
        siswa_id = $1,
        kelas_id = $2,
        mapel_id = $3,
        semester = $4,
        tahun_ajaran = $5,
        nilai_akhir = $6,
        keterangan = $7,
        file_url = $8,
        tanggal_terbit = $9
      WHERE id = $10 RETURNING *`,
      [
        siswa_id, kelas_id, mapel_id, semester,
        tahun_ajaran, nilai_akhir, keterangan,
        file_url, tanggal_terbit, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Raport tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error update raport", err);
    res.status(500).json({ error: "Gagal update raport" });
  }
};

// ❌ Hapus raport
const deleteRaport = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM raport WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Raport tidak ditemukan" });
    }

    res.json({ message: "Raport berhasil dihapus", raport: result.rows[0] });
  } catch (err) {
    console.error("Error hapus raport", err);
    res.status(500).json({ error: "Gagal hapus raport" });
  }
};

module.exports = {
  getAllRaport,
  getRaportById,
  addRaport,
  updateRaport,
  deleteRaport,
};
