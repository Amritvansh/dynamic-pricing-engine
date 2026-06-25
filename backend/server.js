const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

// ── CORS — production whitelist ────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://dynamic-pricing-engine.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

// ── Health check (BEFORE all routes — Render uses this) ─
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ── Route imports ──────────────────────────────────────
const productRoutes = require("./src/routes/productRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const competitorRoutes = require("./src/routes/competitorRoutes");
const pricingRoutes = require("./src/routes/pricingRoutes");
const salesRoutes = require("./src/routes/salesRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");

// ── Mount routes ───────────────────────────────────────
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/competitors", competitorRoutes);
app.use("/api/v1/pricing", pricingRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// ── Error handler ──────────────────────────────────────
const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

// ── Start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // Start background scheduler after DB connects — must not crash the server
  const { startScheduler } = require("./src/services/scheduler");
  startScheduler().catch((err) =>
    console.error("[Scheduler] Failed to start:", err.message),
  );

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
