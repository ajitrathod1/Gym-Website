// server/server.js
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health
app.get('/', (req, res) => res.send('Boost Fitness Club backend running'));

// contact endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Sent' });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return res.status(500).json({ success: false, message: 'Mail error' });
  }
});

// join endpoint
app.post('/api/join', async (req, res) => {
  const { name, phone, email, plan } = req.body;
  if (!name || !phone) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Join Request: ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\nPlan: ${plan || 'N/A'}`
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Sent' });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return res.status(500).json({ success: false, message: 'Mail error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
