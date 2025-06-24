// ===== routes/mapel.routes.js =====
const express = require("express");
const router = express.Router();

const {
  getAllMapel,
  getMapelById,
  addMapel,
  updateMapel,
  deleteMapel,
} = require("../controllers/mapel.controller");

router.get("/", getAllMapel);
router.get("/:id", getMapelById);
router.post("/", addMapel);
router.put("/:id", updateMapel);
router.delete("/:id", deleteMapel);

module.exports = router;