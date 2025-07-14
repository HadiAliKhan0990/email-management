const express = require('express');
const app = express();
require('./connection/db');
const dotenv = require('dotenv');
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
const routes = require('./routes/routes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');

app.use('/api', routes);
app.use('/api/qrcode', qrCodeRoutes);

app.get('/view-qr', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>QR Code Viewer</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              textarea { width: 100%; height: 100px; margin: 10px 0; }
              button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
              .qr-display { margin-top: 20px; text-align: center; }
          </style>
      </head>
      <body>
          <h1>QR Code Viewer</h1>
          <p>Paste the QR code data URL from your API response:</p>
          <textarea id="qrData" placeholder="Paste the qrCode value here..."></textarea>
          <br>
          <button onclick="showQR()">Show QR Code</button>
          <div id="qrDisplay" class="qr-display"></div>
  
          <script>
              function showQR() {
                  const qrData = document.getElementById('qrData').value.trim();
                  const display = document.getElementById('qrDisplay');
                  
                  if (qrData && qrData.startsWith('data:image/')) {
                      display.innerHTML = '<img src="' + qrData + '" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #ccc;">';
                  } else {
                      alert('Please paste a valid QR code data URL that starts with "data:image/"');
                  }
              }
          </script>
      </body>
      </html>
    `);
  });
  
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
