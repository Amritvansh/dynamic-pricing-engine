/**
 * seed.js — Populates the database with 5 sample products + matching
 * inventory, competitor prices, sales events, and settings.
 *
 * Run:  node src/config/seed.js   (from /backend)
 * Requires MONGO_URL in .env
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Product = require('../models/product');
const Inventory = require('../models/inventory');
const CompetitorPrice = require('../models/competitorPrice');
const SalesEvent = require('../models/salesEvent');
const Settings = require('../models/settings');
const PromotionalEvent = require('../models/promotionalEvent');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected for seeding...');

    // ── Clear existing data ────────────────────────────
    await Promise.all([
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      CompetitorPrice.deleteMany({}),
      SalesEvent.deleteMany({}),
      Settings.deleteMany({}),
      PromotionalEvent.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // ── 1. Settings (seed data from Part 5 Schema 8) ───
    await Settings.insertMany([
      { key: 'schedulerEnabled',           value: true,  description: 'Enable background price recalculation' },
      { key: 'schedulerIntervalMinutes',   value: 30,    description: 'Minutes between auto-recalculation runs' },
      { key: 'autoApplyThreshold',         value: 0.80,  description: 'Confidence threshold for auto-apply' },
      { key: 'minChangeThreshold',         value: 0.01,  description: '1% minimum change to avoid noise' },
      { key: 'seasonalPricingEnabled',     value: true,  description: 'Master toggle for seasonal pricing' },
      { key: 'seasonalDisabledCategories', value: [],    description: 'Categories excluded from seasonal pricing' },
      { key: 'eventsEnabled',             value: true,  description: 'Master toggle for promotional events' },
      { key: 'maxGlobalDiscountPercent',   value: 0.30,  description: 'Global max discount safety cap (30%)' },
    ]);
    console.log('Settings seeded.');

    // ── 2. Products ────────────────────────────────────
    const products = await Product.insertMany([
      {
        productName: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics',
        costPrice: 400, basePrice: 799, currentPrice: 799,
        tier: 'mid', targetMargin: 0.15,
        pricingStrategy: { mode: 'auto', maxIncreasePct: 0.15, maxDecreasePct: 0.15 },
        seasonalConfig: { season: 'none' },
      },
      {
        productName: 'Gaming Keyboard', sku: 'GK-002', category: 'Electronics',
        costPrice: 1500, basePrice: 2999, currentPrice: 2999,
        tier: 'premium', targetMargin: 0.20,
        pricingStrategy: { mode: 'auto', maxIncreasePct: 0.10, maxDecreasePct: 0.10 },
        seasonalConfig: { season: 'festive', startDate: '10-01', peakDate: '10-15', endDate: '10-30', maxBoost: 0.15 },
      },
      {
        productName: 'Cotton T-Shirt', sku: 'TS-003', category: 'Clothing',
        costPrice: 150, basePrice: 399, currentPrice: 399,
        tier: 'budget', targetMargin: 0.10,
        pricingStrategy: { mode: 'auto', maxIncreasePct: 0.20, maxDecreasePct: 0.20 },
        seasonalConfig: { season: 'summer', startDate: '04-01', peakDate: '05-15', endDate: '06-30', maxBoost: 0.10 },
      },
      {
        productName: 'Yoga Mat', sku: 'YM-004', category: 'Sports',
        costPrice: 300, basePrice: 699, currentPrice: 699,
        tier: 'mid', targetMargin: 0.15,
        pricingStrategy: { mode: 'auto', maxIncreasePct: 0.15, maxDecreasePct: 0.15 },
        seasonalConfig: { season: 'none' },
      },
      {
        productName: 'Desk Lamp', sku: 'DL-005', category: 'Home',
        costPrice: 600, basePrice: 1299, currentPrice: 1299,
        tier: 'mid', targetMargin: 0.15,
        pricingStrategy: { mode: 'auto', maxIncreasePct: 0.10, maxDecreasePct: 0.10 },
        seasonalConfig: { season: 'none' },
      },
    ]);
    console.log(`Seeded ${products.length} products.`);

    // ── 3. Inventory ───────────────────────────────────
    await Inventory.insertMany([
      { productId: products[0]._id, availableQuantity: 45, emaDailySales: 6.9, coverageDays: 6.5, inventoryStatus: 'low' },
      { productId: products[1]._id, availableQuantity: 120, emaDailySales: 5.0, coverageDays: 24.0, inventoryStatus: 'high' },
      { productId: products[2]._id, availableQuantity: 500, emaDailySales: 20.0, coverageDays: 25.0, inventoryStatus: 'high' },
      { productId: products[3]._id, availableQuantity: 5, emaDailySales: 3.0, coverageDays: 1.7, inventoryStatus: 'critical' },
      { productId: products[4]._id, availableQuantity: 60, emaDailySales: 5.0, coverageDays: 12.0, inventoryStatus: 'normal' },
    ]);
    console.log('Inventory seeded.');

    // ── 4. Competitor Prices ───────────────────────────
    await CompetitorPrice.insertMany([
      { productId: products[0]._id, competitorName: 'Amazon', competitorPrice: 749, recordedAt: new Date() },
      { productId: products[0]._id, competitorName: 'Flipkart', competitorPrice: 789, recordedAt: new Date() },
      { productId: products[0]._id, competitorName: 'Croma', competitorPrice: 819, recordedAt: new Date() },
      { productId: products[1]._id, competitorName: 'Amazon', competitorPrice: 2899, recordedAt: new Date() },
      { productId: products[1]._id, competitorName: 'Flipkart', competitorPrice: 3099, recordedAt: new Date() },
      { productId: products[2]._id, competitorName: 'Myntra', competitorPrice: 349, recordedAt: new Date() },
      { productId: products[2]._id, competitorName: 'Ajio', competitorPrice: 379, recordedAt: new Date() },
      { productId: products[3]._id, competitorName: 'Amazon', competitorPrice: 649, recordedAt: new Date() },
      { productId: products[4]._id, competitorName: 'Amazon', competitorPrice: 1199, recordedAt: new Date() },
      { productId: products[4]._id, competitorName: 'Flipkart', competitorPrice: 1349, recordedAt: new Date() },
    ]);
    console.log('Competitor prices seeded.');

    // ── 5. Sales Events (spread over last 7 days) ─────
    const salesData = [];
    const now = Date.now();
    const channels = ['web', 'mobile', 'store', 'manual'];

    products.forEach((p) => {
      // Generate 20+ sales per product across 7 days
      for (let i = 0; i < 25; i++) {
        const daysAgo = Math.random() * 7;
        const hoursOffset = Math.random() * 24;
        const soldAt = new Date(now - (daysAgo * 24 + hoursOffset) * 3600 * 1000);
        salesData.push({
          productId: p._id,
          quantity: Math.floor(Math.random() * 4) + 1,
          priceAtSale: p.currentPrice,
          channel: channels[Math.floor(Math.random() * channels.length)],
          soldAt,
          eventId: null,
          isPromotional: false,
          isCancelled: false,
        });
      }
    });

    await SalesEvent.insertMany(salesData);
    console.log(`Seeded ${salesData.length} sales events.`);

    // ── 6. Sample Promotional Event (1 ACTIVE) ────────
    const twoDaysAgo = new Date(now - 2 * 24 * 3600 * 1000);
    const threeDaysFromNow = new Date(now + 3 * 24 * 3600 * 1000);

    await PromotionalEvent.create({
      eventName: 'Weekend Electronics Sale',
      eventType: 'weekend_sale',
      description: '15% off all electronics this weekend',
      startDate: twoDaysAgo,
      endDate: threeDaysFromNow,
      status: 'ACTIVE',
      priority: 2,
      discountType: 'percentage',
      discountValue: 15,
      targetType: 'specific_categories',
      targetCategories: ['Electronics'],
      respectProfitFloor: true,
    });
    console.log('Promotional event seeded.');

    console.log('\n✅ Seed complete! All data inserted successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
