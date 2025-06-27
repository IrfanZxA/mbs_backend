const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifySiswa = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.siswa = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

module.exports = verifySiswa;
