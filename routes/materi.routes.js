const express = require("express");
const router = express.Router();

const {
  getAllMateri,
  getMateriById,
  addMateri,
  updateMateri,
  deleteMateri,
} = require("../controllers/materi.controller");

router.get("/", getAllMateri);
router.get("/:id", getMateriById);
router.post("/", addMateri);
router.put("/:id", updateMateri);
router.delete("/:id", deleteMateri);

module.exports = router;
