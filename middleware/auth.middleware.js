const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak, token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan hasil decode token di req.user
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Akses hanya untuk admin" });
  }
  req.admin = req.user;  // Tambahkan ini biar req.admin ada
  next();
};

module.exports = { verifyToken, verifyAdmin };
