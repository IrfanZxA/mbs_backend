const express = require("express");
const router = express.Router();

const {
  getAllNilai,
  getNilaiById,
  addNilai,
  updateNilai,
  deleteNilai,
} = require("../controllers/nilai.controller");

router.get("/", getAllNilai);
router.get("/:id", getNilaiById);
router.post("/", addNilai);
router.put("/:id", updateNilai);
router.delete("/:id", deleteNilai);

module.exports = router;
