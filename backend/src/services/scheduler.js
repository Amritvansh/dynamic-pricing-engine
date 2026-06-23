const cron = require("node-cron");
const Product = require("../models/product");
const Settings = require("../models/settings");
const { runPricingEngine } = require("./pricingEngine");
const { updateEMAForProduct } = require("./emaService");

let pricingTask = null;

let emaTask = null;

async function startScheduler() {
  const settings = await Settings.findOne({
    key: "schedulerIntervalMinutes",
  });
  const interval = settings?.value || 30;

  pricingTask = cron.schedule(`*/${interval} * * * *`, async () => {
    console.log(
      `[Scheduler] Running batch recalculation at ${new Date().toISOString()}`,
    );
    const products = await Product.find({
      isActive: true,
      "pricingStrategy.mode": "auto",
    });

    let applied = 0,
      skipped = 0,
      failed = 0;

    for (const product of products) {
      try {
        const result = await runPricingEngine(
          product._id,
          new Date(),
          "scheduler",
        );
        if (
          result.outcome?.shouldApply &&
          result.outcome?.confidenceScore >= 0.8
        ) {
          await Product.findByIdAndUpdate(product._id, {
            currentPrice: result.eventOverlay?.eventApplied
              ? result.eventOverlay.priceAfterDiscount
              : result.outcome.recommendedPrice,
          });
          applied++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[Scheduler] Failed for ${product._id}:`, err.message);
        failed++;
      }
    }
    console.log(
      `[Scheduler] Done: ${applied} applied, ${skipped} skipped, ${failed} failed`,
    );
  });

  emaTask = cron.schedule("0 * * * *", async () => {
    console.log(`[EMA] Updating EMA for all products`);
    const products = await Product.find({ isActive: true });
    for (const product of products) {
      try {
        await updateEMAForProduct(product._id);
      } catch (err) {
        console.error(`[EMA] Failed for ${product._id}:`, err.message);
      }
    }
  });

  console.log(
    `[Scheduler] Started — pricing every ${interval}min, EMA every 1h`,
  );
}

function stopScheduler() {
  if (pricingTask) {
    pricingTask.stop();
    pricingTask = null;
  }
  if (emaTask) {
    emaTask.stop();
    emaTask = null;
  }
  console.log("[Scheduler] Stopped");
}

module.exports = { startScheduler, stopScheduler };
