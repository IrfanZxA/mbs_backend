const dataSiswa = [
  { id: 1, nama: 'Ahmad Fikri', kelas: 'XII IPA 1' },
  { id: 2, nama: 'Siti Aisah', kelas: 'XII IPS 2' },
  { id: 3, nama: 'Nuril Midayat', kelas: 'XII IPA 3' }
];

const getAllSiswa = (req, res) => {
  res.json(dataSiswa);
};

module.exports = { getAllSiswa };
