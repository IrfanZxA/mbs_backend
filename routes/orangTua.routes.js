const express = require("express");
const router = express.Router();
const verifyOrangTua = require("../middleware/verifyOrangTua");

const {
  getAllOrangTua,
  getOrangTuaById,
  addOrangTua,
  updateOrangTua,
  deleteOrangTua,
  loginOrangTua,
  getProfileOrangTua,
} = require("../controllers/orangTua.controller");

router.post("/login", loginOrangTua);

router.use(verifyOrangTua);

router.get("/profile", getProfileOrangTua);
router.get("/", getAllOrangTua);
router.get("/:id", getOrangTuaById);
router.post("/", addOrangTua);
router.put("/:id", updateOrangTua);
router.delete("/:id", deleteOrangTua);

module.exports = router;
