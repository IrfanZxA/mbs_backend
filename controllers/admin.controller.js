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

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
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

module.exports = {
  loginAdmin,
  getAdminProfile,
};
