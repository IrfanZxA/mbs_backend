const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyOrangTua = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak, token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.orangTua = decoded; // data disimpan ke request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

module.exports = verifyOrangTua;
