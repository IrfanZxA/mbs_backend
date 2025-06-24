const express = require("express");
const router = express.Router();

const {
  getAllKelas,
  getKelasById,
  addKelas,
  updateKelas,
  deleteKelas,
} = require("../controllers/kelas.controller");

router.get("/", getAllKelas);        
router.get("/:id", getKelasById);    
router.post("/", addKelas);         
router.put("/:id", updateKelas);     
router.delete("/:id", deleteKelas);  

module.exports = router;
