const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const ExchangeRate = require('./models/ExchangeRate');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Clear existing data
    await Product.deleteMany({});
    await ExchangeRate.deleteMany({});
    console.log('Cleared existing data');

    // Seed Products - GOLD
    const goldProducts = [
      {
        name: 'ATLANTICA ONLINE VALOFE',
        type: 'gold',
        stock: 999,
        price: 999999,
        currency: 'IDR',
        serverName: 'ATLANTICA ONLINE VALOFE',
        status: 'available',
      },
      {
        name: 'ATLANTICA ONLINE REBIRTH OLD',
        type: 'gold',
        stock: 999,
        price: 999999,
        currency: 'IDR',
        serverName: 'ATLANTICA ONLINE REBIRTH OLD',
        status: 'available',
      },
      {
        name: 'ATLANTICA ONLINE RAGNAROK',
        type: 'gold',
        stock: 999,
        price: 999999,
        currency: 'IDR',
        serverName: 'ATLANTICA ONLINE RAGNAROK',
        status: 'available',
      },
      {
        name: 'ATLANTICA ONLINE ETERNAL',
        type: 'gold',
        stock: 999,
        price: 999999,
        currency: 'IDR',
        serverName: 'ATLANTICA ONLINE ETERNAL',
        status: 'available',
      },
    ];

    // Seed Products - BOT SERVICE
    const botServiceProducts = [
      {
        name: 'Elite Bot Service',
        type: 'bot_service',
        tier: 'elite',
        stock: 999,
        price: 150000,
        currency: 'IDR',
        status: 'available',
        description: 'Elite tier bot service with advanced features',
      },
      {
        name: 'Exclusive Bot Service',
        type: 'bot_service',
        tier: 'exclusive',
        stock: 999,
        price: 175000,
        currency: 'IDR',
        status: 'available',
        description: 'Exclusive tier with premium support',
        billingPeriod: 'IDR 160,000 per month after',
      },
    ];

    // Seed Products - JOCKEY
    const jockeyProducts = [
      {
        name: 'Daily Jockey Plan',
        type: 'jockey',
        tier: 'daily',
        stock: 999,
        price: 30000,
        currency: 'IDR',
        status: 'available',
        billingPeriod: 'daily',
      },
      {
        name: 'Weekly Jockey Plan',
        type: 'jockey',
        tier: 'weekly',
        stock: 999,
        price: 175000,
        currency: 'IDR',
        status: 'available',
        billingPeriod: 'weekly',
      },
      {
        name: 'Monthly Jockey Plan',
        type: 'jockey',
        tier: 'monthly',
        stock: 999,
        price: 600000,
        currency: 'IDR',
        status: 'available',
        billingPeriod: 'monthly',
      },
    ];

    // Insert all products (order = position within its own type, for admin drag/reorder)
    const withOrder = list => list.map((p, i) => ({ ...p, order: i }));
    await Product.insertMany([
      ...withOrder(goldProducts),
      ...withOrder(botServiceProducts),
      ...withOrder(jockeyProducts),
    ]);
    console.log('✓ Products seeded');

    // Seed Exchange Rates
    const exchangeRates = [
      {
        currency: 'USD',
        rateToIDR: 15500,
      },
      {
        currency: 'EUR',
        rateToIDR: 17000,
      },
      {
        currency: 'GBP',
        rateToIDR: 19500,
      },
      {
        currency: 'JPY',
        rateToIDR: 105,
      },
    ];

    await ExchangeRate.insertMany(exchangeRates);
    console.log('✓ Exchange rates seeded');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
