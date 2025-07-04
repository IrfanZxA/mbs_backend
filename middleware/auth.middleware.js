const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak, token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Tambahkan pengecekan role
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Akses hanya untuk admin" });
    }

    req.admin = decoded; // Lolos, simpan data ke request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

module.exports = verifyAdmin;
