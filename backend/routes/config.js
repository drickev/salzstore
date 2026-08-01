const express = require('express');
const router = express.Router();

// Public site config (social links, etc.)
router.get('/', (req, res) => {
  res.json({
    facebookUrl: process.env.SOCIAL_FACEBOOK_URL || '',
    whatsappUrl: process.env.SOCIAL_WHATSAPP_URL || '',
  });
});

module.exports = router;
