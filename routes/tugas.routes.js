const express = require('express');
const router = express.Router();
const { getTugasSiswa } = require('../controllers/tugas.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/siswa/tugas', verifyToken, getTugasSiswa);

module.exports = router;
