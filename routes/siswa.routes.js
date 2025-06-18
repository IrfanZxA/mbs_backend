const express = require('express');
const router = express.Router();
const { getAllSiswa } = require('../controllers/siswa.controller');

router.get('/', getAllSiswa);

module.exports = router;
