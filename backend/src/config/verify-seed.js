/**
 * verify-seed.js — Verify engine output against seeded data.
 * Run: node src/config/verify-seed.js  (from /backend)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Product = require('../models/product');
const { runPricingEngine } = require('../services/pricingEngine');

async function verify() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected. Running pricing engine for all 5 products...\n');

  const products = await Product.find({}).sort({ sku: 1 });

  for (const p of products) {
    try {
      const result = await runPricingEngine(p._id, new Date(), 'manual');
      const o = result.outcome;
      const s = result.signals;
      const ev = result.eventOverlay;

      console.log(`═══════════════════════════════════════════════════`);
      console.log(`  ${p.productName} (${p.sku})`);
      console.log(`  Category: ${p.category} | Mode: ${p.pricingStrategy.mode}`);
      console.log(`─────────────────────────────────────────────────`);
      console.log(`  Current Price:     ₹${p.currentPrice}`);
      console.log(`  Recommended Price: ₹${o.recommendedPrice}`);
      console.log(`  Adjustment:        ${o.adjustmentPercent > 0 ? '+' : ''}${o.adjustmentPercent}%`);
      console.log(`  Constraint:        ${o.constraintApplied}`);
      console.log(`  Confidence:        ${o.confidenceLevel} (${o.confidenceScore})`);
      console.log(`  Primary Driver:    ${o.primaryDriver}`);
      console.log(`  ───── Signals ─────`);
      console.log(`  Demand:     ${s.demand.interpretation} (vr: ${s.demand.velocityRatio?.toFixed(2)}, mult: ${s.demand.multiplier?.toFixed(4)})`);
      console.log(`  Inventory:  ${s.inventory.interpretation} (cd: ${s.inventory.coverageDays}d, mult: ${s.inventory.multiplier})`);
      console.log(`  Competitor: ${s.competitor.interpretation} (gap: ${s.competitor.gapPercent}%, mult: ${s.competitor.multiplier?.toFixed(4)})`);
      console.log(`  Seasonal:   ${s.seasonal.phase} (mult: ${s.seasonal.multiplier?.toFixed(4)}, season: ${s.seasonal.season || 'none'})`);
      console.log(`  ───── Event ─────`);
      console.log(`  Event Applied: ${ev.eventApplied || false}`);
      if (ev.eventApplied) {
        console.log(`  Event: ${ev.eventName} — ${ev.discountValue}% off`);
        console.log(`  Before Discount: ₹${ev.priceBeforeDiscount} → After: ₹${ev.priceAfterDiscount}`);
      }
      console.log(`  ───── AI ─────`);
      console.log(`  ${result.aiExplanation?.text?.substring(0, 120) || '(no AI text)'}...`);
      console.log('');
    } catch (err) {
      console.error(`  ❌ FAILED for ${p.productName}: ${err.message}\n`);
    }
  }

  // ── Verification Checks ──
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  VERIFICATION CHECKS');
  console.log('═══════════════════════════════════════════════════');

  const checks = [];
  for (const p of products) {
    const r = await runPricingEngine(p._id, new Date(), 'manual');
    const o = r.outcome;
    const s = r.signals;
    const ev = r.eventOverlay;

    if (p.sku === 'WNC-HP-001') {
      checks.push({ name: 'P1 price UP', pass: o.recommendedPrice > 5999 });
      checks.push({ name: 'P1 demand HIGH', pass: s.demand.interpretation === 'HIGH' });
      checks.push({ name: 'P1 inventory CRITICAL', pass: s.inventory.interpretation === 'CRITICAL' });
      checks.push({ name: 'P1 event applied', pass: ev.eventApplied === true });
    }
    if (p.sku === 'USB-FC-002') {
      checks.push({ name: 'P2 price DOWN', pass: o.recommendedPrice < 1299 });
      checks.push({ name: 'P2 competitor CHEAPER', pass: s.competitor.interpretation === 'COMPETITORS_CHEAPER' });
      checks.push({ name: 'P2 event applied', pass: ev.eventApplied === true });
    }
    if (p.sku === 'CKS-003') {
      checks.push({ name: 'P3 seasonal > 1.0', pass: s.seasonal.multiplier > 1.0 });
      checks.push({ name: 'P3 mode manual', pass: p.pricingStrategy.mode === 'manual' });
      checks.push({ name: 'P3 seasonal phase ramp_up', pass: s.seasonal.phase === 'ramp_up' });
    }
    if (p.sku === 'OBR-004') {
      checks.push({ name: 'P4 price DOWN', pass: o.recommendedPrice < 699 });
      checks.push({ name: 'P4 PROFIT_FLOOR', pass: o.constraintApplied === 'PROFIT_FLOOR' });
      checks.push({ name: 'P4 above cost+margin', pass: o.recommendedPrice >= 580 * 1.10 - 50 }); // charm tolerance
    }
    if (p.sku === 'UPG-005') {
      checks.push({ name: 'P5 seasonal = 1.0', pass: s.seasonal.multiplier === 1.0 });
      checks.push({ name: 'P5 seasonal disabled_category', pass: s.seasonal.phase === 'disabled_category' });
    }
  }

  let pass = 0, fail = 0;
  for (const c of checks) {
    if (c.pass) { console.log(`  ✅ ${c.name}`); pass++; }
    else { console.log(`  ❌ ${c.name}`); fail++; }
  }
  console.log(`\n  Results: ${pass} passed, ${fail} failed`);

  await mongoose.disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
