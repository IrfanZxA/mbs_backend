const express = require("express");
const router = express.Router();
const siswaController = require('../controllers/siswa.controller');
const verifySiswa = require("../middleware/verifySiswa");
const upload = require('../middleware/upload'); 


const {
  loginSiswa,
  getProfileSiswa,
  getTugasSiswa,
  getJadwalHariIni,
  getJadwalMingguan,
  getMateriSiswa,
  getMateriByKodeMapel,
} = require("../controllers/siswa.controller");

router.post('/login', loginSiswa);

router.get("/profile", verifySiswa, getProfileSiswa);
router.get("/tugas", verifySiswa, getTugasSiswa);
router.get("/jadwal-hari-ini", verifySiswa, getJadwalHariIni);
router.get("/jadwal-mingguan", verifySiswa, getJadwalMingguan);
router.get('/presensi', verifySiswa, siswaController.getPresensiSiswa);
router.post('/ajukan-izin', verifySiswa, upload.single('file'), siswaController.ajukanIzin);
router.get('/materi', verifySiswa, getMateriSiswa);
router.get("/materi/:kode_mapel", verifySiswa, getMateriByKodeMapel);
router.get('/materi/detail/:id', verifySiswa, siswaController.getDetailMateri);



module.exports = router;
