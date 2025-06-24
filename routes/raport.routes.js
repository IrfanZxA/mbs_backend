const express = require("express");
const router = express.Router();

const {
  getAllRaport,
  getRaportById,
  addRaport,
  updateRaport,
  deleteRaport,
} = require("../controllers/raport.controller");

router.get("/", getAllRaport);
router.get("/:id", getRaportById);
router.post("/", addRaport);
router.put("/:id", updateRaport);
router.delete("/:id", deleteRaport);

module.exports = router;
