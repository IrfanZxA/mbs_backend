const express = require('express');
const cors = require('cors');
require('dotenv').config();   // <- ini untuk .env
require('./db');              // <- ini untuk connect ke database

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ROUTES
const siswaRoutes = require('./routes/siswa.routes');
app.use('/siswa', siswaRoutes);

app.get('/', (req, res) => {
  res.send('Backend MBS Prambanan aktif!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
