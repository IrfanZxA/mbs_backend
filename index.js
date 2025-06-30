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
const tugasRoutes = require('./routes/tugas.routes');

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
app.use('/tugas', tugasRoutes);
app.use("/uploads", express.static("uploads"));


const os = require("os");
const ip = Object.values(os.networkInterfaces())
  .flat()
  .find((i) => i.family === "IPv4" && !i.internal).address;

app.listen(5000, () => {
  console.log(`Server running at http://localhost:5000`);
});

