const express = require("express");
const router = express.Router();
const { loginAdmin, getAdminProfile } = require("../controllers/admin.controller");
const verifyToken = require("../middleware/auth.middleware");

router.post("/login", loginAdmin);

// ⛔ Hanya admin yang sudah login (dengan token) bisa akses ini
router.get("/profile", verifyToken, getAdminProfile);

module.exports = router;
