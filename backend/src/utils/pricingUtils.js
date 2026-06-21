function charmPrice(price) {
  const rounded = Math.round(price / 50) * 50;
  return rounded - 1;
}

function getDayOfYear(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = { charmPrice, getDayOfYear, clamp };
