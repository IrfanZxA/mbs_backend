const express = require("express");
const router = express.Router();
const verifySiswa = require("../middleware/verifySiswa");

const {
  loginSiswa,
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
  getProfileSiswa,
} = require("../controllers/siswa.controller");

router.post("/login", loginSiswa);

router.use(verifySiswa);

router.get("/profile", getProfileSiswa);
router.get("/", getAllSiswa);
router.get("/:id", getSiswaById);
router.post("/", addSiswa);
router.put("/:id", updateSiswa);
router.delete("/:id", deleteSiswa);

module.exports = router;
