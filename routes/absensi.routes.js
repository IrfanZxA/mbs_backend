const express = require("express");
const router = express.Router();

const {
  getAllAbsensi,
  getAbsensiById,
  addAbsensi,
  updateAbsensi,
  deleteAbsensi,
} = require("../controllers/absensi.controller");

router.get("/", getAllAbsensi);
router.get("/:id", getAbsensiById);
router.post("/", addAbsensi);
router.put("/:id", updateAbsensi);
router.delete("/:id", deleteAbsensi);

module.exports = router;
