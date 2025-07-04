const express = require('express');
const router = express.Router();
const tugasController = require('../controllers/tugas.controller');
const { getTugasSiswa } = require('../controllers/tugas.controller');
const verifySiswa = require('../middleware/verifySiswa');
const verifyGuru = require("../middleware/verifyGuru");
const upload = require('../middleware/upload');

router.get('/siswa/tugas', verifySiswa, getTugasSiswa);
router.get('/guru', verifyGuru, tugasController.getTugasByGuru);
router.post('/', verifyGuru, upload.single('file'), (req, res, next) => {
  console.log("✅ MASUK POST /tugas");
  next();
}, tugasController.addTugas);

module.exports = router;
