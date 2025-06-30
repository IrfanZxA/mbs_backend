const express = require("express");
const router = express.Router();
const verifyGuru = require("../middleware/verifyGuru");
const absensiController = require("../controllers/absensi.controller")


const {
  getAllAbsensi,
  getAbsensiById,
  addAbsensi,
  updateAbsensi,
  deleteAbsensi,
  addAbsensiBulk,
  getSiswaByKelas
} = require("../controllers/absensi.controller");

router.get("/", getAllAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", addAbsensi);
router.put("/:id", updateAbsensi);
router.delete("/:id", deleteAbsensi);
router.post("/bulk", addAbsensiBulk);
router.get('/siswa/:kelas_id', verifyGuru, getSiswaByKelas);
router.get("/rekap/:kelas_id", absensiController.getRekapAbsensiByKelas);

module.exports = router;
