const express = require("express");
const router = express.Router();
const { loginSiswa, getProfileSiswa } = require("../controllers/siswa.controller");
const verifySiswa = require("../middleware/verifySiswa");

// ✅ Endpoint login tanpa middleware
router.post("/login", loginSiswa);

// ✅ Contoh endpoint lain setelah login (butuh token)
router.get("/profile", verifySiswa, getProfileSiswa);

module.exports = router;
