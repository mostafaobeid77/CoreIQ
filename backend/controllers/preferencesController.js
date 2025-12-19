const UserPreferences = require('../models/UserPreferences');

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.userId });
    
    if (!preferences) {
      preferences = new UserPreferences({
        userId: req.userId,
        theme: 'light',
        units: 'metric'
      });
      await preferences.save();
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { theme, units, waterRemindersEnabled, wellnessRemindersEnabled } = req.body;
    
    const updateData = {};
    if (theme) updateData.theme = theme;
    if (units) updateData.units = units;
    if (waterRemindersEnabled !== undefined) updateData.waterRemindersEnabled = waterRemindersEnabled;
    if (wellnessRemindersEnabled !== undefined) updateData.wellnessRemindersEnabled = wellnessRemindersEnabled;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('Update preferences error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};










