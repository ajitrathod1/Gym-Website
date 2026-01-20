require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

/* ---------- AUTO-CREATE UPLOAD FOLDERS ---------- */
['public/uploads/members', 'public/uploads/posts'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ---------- BASIC MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // serves entire frontend
app.use('/uploads', express.static('public/uploads'));

/* ---------- ROUTES ---------- */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/member', require('./routes/member'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/content', require('./routes/content'));

/* ---------- WILDCARD → SEND SPA (Express 5 compatible) ---------- */
app.use((req, res) => res.sendFile(path.resolve('public/index.html')));

/* ---------- SEED FIRST ADMIN ---------- */
const seedAdmin = async () => {
  const exists = await Admin.findOne({ username: 'admin' });
  if (!exists) {
    await Admin.create({
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    });
    console.log('✅ Default admin created  (admin / admin123)');
  }
};

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;
// (async () => {
//   try {
//     await connectDB();
//     await seedAdmin();
//     app.listen(PORT, () => console.log(`🚀 Smart Gym Web running on http://localhost:${PORT}`));
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// })();

(async () => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (err) {
    console.log("⚠️ Database connection failed. Starting in offline mode (static files only).");
    console.error(err.message);
  }
  app.listen(PORT, () => console.log(`🚀 Smart Gym Web running on http://localhost:${PORT}`));
})();