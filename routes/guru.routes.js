const express = require("express");
const router = express.Router();
const verifyGuru = require("../middleware/verifyGuru");

const {
  loginGuru,
  getAllGuru,
  getGuruById,
  addGuru, 
  updateGuru,
  deleteGuru,
  getProfileGuru,
} = require("../controllers/guru.controller");

router.post("/login", loginGuru);
router.get("/profile", verifyGuru, getProfileGuru);

router.get("/", getAllGuru);
router.get("/:id", getGuruById);
router.post("/", addGuru); 
router.put("/:id", updateGuru);
router.delete("/:id", deleteGuru);

module.exports = router;
