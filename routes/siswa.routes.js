const express = require("express");
const router = express.Router();

const {
  getAllSiswa,
  getSiswaById,
  addSiswa,
  updateSiswa,
  deleteSiswa,
} = require("../controllers/siswa.controller");

router.get("/", getAllSiswa);
router.get("/:id", getSiswaById);
router.post("/", addSiswa);
router.put("/:id", updateSiswa);
router.delete("/:id", deleteSiswa);

module.exports = router;
