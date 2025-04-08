const express = require('express');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Function to send email alert
function sendEmailNotification(report) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'helppawalerts@gmail.com',
      pass: 'udjxyqctbqqspxfq' // ← Replace this with your 16-char Gmail App Password
    }
  });

  const mailOptions = {
    from: '"Help Paw Alerts" <helppawalerts@gmail.com>',
    to: 'info@animalrescuetrust.org,communication@pfahyd.org,thevaishnavichavan@gmail.com,helppawalerts@gmail.com',
    subject: '🚨 New Animal Distress Report - Help Paw',
    html: `
      <h2>🚨 New Animal Distress Report Submitted!</h2>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Location:</strong> 
        <a href="https://www.google.com/maps?q=${report.latitude},${report.longitude}" target="_blank">
          Click to view on Google Maps
        </a>
      </p>
      <p><strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
      <p><strong>Photo Filename:</strong> ${report.photo || 'No photo uploaded'}</p>
      <br>
      <p>🐾 <strong>Help Paw Team</strong></p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
    } else {
      console.log('✅ Email sent:', info.response);
    }
  });
}

// POST /report
app.post('/report', upload.single('photo'), (req, res) => {
  const { description, latitude, longitude } = req.body;
  const photo = req.file;

  const newReport = {
    id: Date.now(),
    description,
    latitude,
    longitude,
    photo: photo ? photo.filename : null,
    timestamp: new Date()
  };

  const reports = JSON.parse(fs.readFileSync('reports.json'));
  reports.push(newReport);
  fs.writeFileSync('reports.json', JSON.stringify(reports, null, 2));

  sendEmailNotification(newReport);

  res.status(200).json({ message: 'Report saved and email sent.' });
});

// GET /data
app.get('/data', (req, res) => {
  const reports = JSON.parse(fs.readFileSync('reports.json'));
  res.json(reports);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
