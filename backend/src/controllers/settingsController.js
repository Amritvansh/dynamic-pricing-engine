const asyncHandler = require('../middleware/asyncHandler');
const Settings = require('../models/settings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all settings
// @route   GET /api/v1/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find({});
  sendSuccess(res, settings);
});

// @desc    Update a setting value
// @route   PATCH /api/v1/settings/:key
const updateSetting = asyncHandler(async (req, res) => {
  const { value } = req.body;
  if (value === undefined) return sendError(res, 'value is required', 400);
  const setting = await Settings.findOneAndUpdate(
    { key: req.params.key },
    { value },
    { new: true, runValidators: true }
  );
  if (!setting) return sendError(res, `Setting "${req.params.key}" not found`, 404);
  sendSuccess(res, setting);
});

// @desc    Get seasonal toggle config
// @route   GET /api/v1/settings/seasonal
const getSeasonalSettings = asyncHandler(async (req, res) => {
  const enabledSetting = await Settings.findOne({ key: 'seasonalPricingEnabled' });
  const categoriesSetting = await Settings.findOne({ key: 'seasonalDisabledCategories' });
  const enabled = enabledSetting ? enabledSetting.value : false;
  const categories = (categoriesSetting && Array.isArray(categoriesSetting.value)) ? categoriesSetting.value : [];

  sendSuccess(res, {
    seasonalPricingEnabled: enabled,
    seasonalDisabledCategories: categories,
    summary: `Seasonal pricing is ${enabled ? 'ON' : 'OFF'} globally${categories.length > 0 ? `, disabled for: ${categories.join(', ')}` : ''}`,
  });
});

// @desc    Toggle seasonal ON/OFF
// @route   PATCH /api/v1/settings/seasonal/toggle
const toggleSeasonal = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') return sendError(res, 'enabled must be a boolean', 400);
  const setting = await Settings.findOneAndUpdate(
    { key: 'seasonalPricingEnabled' },
    { value: enabled },
    { new: true, upsert: true }
  );
  sendSuccess(res, { seasonalPricingEnabled: setting.value });
});

// @desc    Update disabled categories list
// @route   PATCH /api/v1/settings/seasonal/categories
const updateSeasonalCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) return sendError(res, 'categories must be an array', 400);
  const setting = await Settings.findOneAndUpdate(
    { key: 'seasonalDisabledCategories' },
    { value: categories },
    { new: true, upsert: true }
  );
  sendSuccess(res, { seasonalDisabledCategories: setting.value });
});

module.exports = { getSettings, updateSetting, getSeasonalSettings, toggleSeasonal, updateSeasonalCategories };
