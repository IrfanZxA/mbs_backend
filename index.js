const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const guruRoutes = require("./routes/guru.routes");
const siswaRoutes = require("./routes/siswa.routes");
const kelasRoutes = require("./routes/kelas.routes");
const mapelRoutes = require("./routes/mapel.routes");
const materiRoutes = require("./routes/materi.routes");
const nilaiRoutes = require("./routes/nilai.routes");
const absensiRoutes = require("./routes/absensi.routes");
const orangTuaRoutes = require("./routes/orangTua.routes");
const raportRoutes = require("./routes/raport.routes");
const adminRoutes = require("./routes/admin.routes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Backend MBS aktif");
});

// ⬅️ Tambahkan ini, pastikan letaknya setelah express.json()
app.use("/guru", guruRoutes);
app.use("/siswa", siswaRoutes);
app.use("/kelas", kelasRoutes);
app.use("/mapel", mapelRoutes);
app.use("/materi", materiRoutes);
app.use("/nilai", nilaiRoutes);
app.use("/absensi", absensiRoutes);
app.use("/orang-tua", orangTuaRoutes);
app.use("/raport", raportRoutes);
app.use("/admin", adminRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
