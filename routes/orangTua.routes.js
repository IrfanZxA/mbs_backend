const express = require("express");
const router = express.Router();

const {
  getAllOrangTua,
  getOrangTuaById,
  addOrangTua,
  updateOrangTua,
  deleteOrangTua,
} = require("../controllers/orangTua.controller");

router.get("/", getAllOrangTua);
router.get("/:id", getOrangTuaById);
router.post("/", addOrangTua);
router.put("/:id", updateOrangTua);
router.delete("/:id", deleteOrangTua);

module.exports = router;
