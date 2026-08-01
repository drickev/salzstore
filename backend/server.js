const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const ADMIN_PANEL_DIR = path.join(__dirname, '..', 'admin-panel');
const exchangeRatesRoute = require('./routes/exchangeRates');

// Middleware
app.use(express.json());
app.use(cors());
// Custom cursor files (.cur/.ani) — Express's default MIME lookup doesn't know
// these extensions and falls back to application/octet-stream, which some
// browsers refuse to use for CSS cursor: url(). Set the correct type manually.
const cursorMimeTypes = { '.cur': 'image/x-icon', '.ani': 'application/x-navi-animation' };
const setCursorHeaders = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (cursorMimeTypes[ext]) res.setHeader('Content-Type', cursorMimeTypes[ext]);
};

app.use(express.static(FRONTEND_DIR, { setHeaders: setCursorHeaders }));
app.use(express.static(ADMIN_PANEL_DIR, { setHeaders: setCursorHeaders }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  return exchangeRatesRoute.syncExchangeRates();
}).then(() => console.log('Exchange rates synced'))
  .catch(err => console.log('Startup error:', err.message));

// Keep exchange rates fresh automatically
setInterval(() => {
  exchangeRatesRoute.syncExchangeRates().catch(err => console.log('Exchange rate sync error:', err.message));
}, 60 * 60 * 1000);

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/exchange-rates', exchangeRatesRoute);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/config', require('./routes/config'));

// Serve frontend / admin panel — an "admin." subdomain always gets the admin panel,
// so production can point admin.<domain> at this same app with no separate deploy.
app.get('/', (req, res) => {
  const isAdminHost = req.hostname && req.hostname.startsWith('admin.');
  res.sendFile(path.join(isAdminHost ? ADMIN_PANEL_DIR : FRONTEND_DIR, isAdminHost ? 'admin.html' : 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ADMIN_PANEL_DIR, 'admin.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
