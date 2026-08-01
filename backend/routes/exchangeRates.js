const express = require('express');
const ExchangeRate = require('../models/ExchangeRate');
const router = express.Router();

// Currencies offered in the storefront calculator. Extend this list to
// support more currencies in the "SELECT CURRENCY" dropdown.
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'MYR'];

// Fetch live rates from the exchange rate API and upsert them as "1 <currency> = X IDR"
async function syncExchangeRates() {
  const response = await fetch(process.env.EXCHANGE_RATE_API);
  if (!response.ok) throw new Error(`Exchange rate API returned ${response.status}`);
  const data = await response.json();
  const rates = data.conversion_rates || data.rates;
  if (!rates || !rates.IDR) throw new Error('Exchange rate API response missing IDR rate');

  const updated = {};
  for (const currency of CURRENCIES) {
    if (!rates[currency]) continue;
    const rateToIDR = rates.IDR / rates[currency];
    updated[currency] = rateToIDR;
    await ExchangeRate.updateOne(
      { currency },
      { rateToIDR, lastUpdated: new Date() },
      { upsert: true }
    );
  }
  return updated;
}

// Get all exchange rates
router.get('/', async (req, res) => {
  try {
    const rates = await ExchangeRate.find();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific currency rate
router.get('/:currency', async (req, res) => {
  try {
    const rate = await ExchangeRate.findOne({ currency: req.params.currency });
    if (!rate) return res.status(404).json({ error: 'Rate not found' });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync exchange rates (call external API)
router.post('/sync/update', async (req, res) => {
  try {
    const rates = await syncExchangeRates();
    res.json({ message: 'Exchange rates synced', rates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.syncExchangeRates = syncExchangeRates;
