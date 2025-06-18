const express = require('express');
const cors = require('cors');

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
