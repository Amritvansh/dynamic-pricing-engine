const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

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

// ── Health check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler ──────────────────────────────────────
const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(
    `Pricing API: POST http://localhost:${PORT}/api/v1/pricing/calculate`,
  );
});
