const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Initialize settings if they don't exist
const getOrCreateSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
};

// Get public settings
router.get('/', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings (Admin only)
router.put('/', adminAuth, upload.single('heroImage'), async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    
    // Parse the data that might come as JSON strings in FormData
    const body = req.body;
    
    if (body.heroTitle) settings.hero.title = body.heroTitle;
    if (body.heroSubtitle) settings.hero.subtitle = body.heroSubtitle;
    if (body.heroDescription) settings.hero.description = body.heroDescription;
    
    // Check for uploaded file
    if (req.file) {
      settings.hero.image = req.file.filename;
    } else if (body.removeHeroImage === 'true') {
      settings.hero.image = null;
    }

    if (body.promoText) settings.promotions.bannerText = body.promoText;
    if (body.promoActive !== undefined) settings.promotions.isActive = body.promoActive === 'true';

    // Parse and save live metal rates
    if (body.metalRates) {
      try {
        const parsed = typeof body.metalRates === 'string' ? JSON.parse(body.metalRates) : body.metalRates;
        settings.metalRates = {
          gold24k: Number(parsed.gold24k) || 7200,
          gold22k: Number(parsed.gold22k) || 6600,
          gold18k: Number(parsed.gold18k) || 5400,
          silver: Number(parsed.silver) || 90,
          platinum: Number(parsed.platinum) || 3500
        };
      } catch (err) {
        console.error("Failed to parse metal rates:", err);
      }
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
