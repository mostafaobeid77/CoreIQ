const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, username, email, profilePhoto } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    // Check if username or email already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ],
        _id: { $ne: req.userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user stats (weight, height, activity, goal) and auto-calculate targets
exports.updateUserStats = async (req, res) => {
  try {
    const { weight, height, activityLevel, goalWeight } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update physical stats
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (goalWeight !== undefined) user.goalWeight = goalWeight;

    // Auto-calculate nutrition targets
    user.calculateNutritionTargets();

    await user.save();

    console.log('✅ User stats updated:', {
      weight: user.weight,
      height: user.height,
      activityLevel: user.activityLevel,
      goalWeight: user.goalWeight,
      targetCalories: user.targetCalories,
      targetProtein: user.targetProtein,
      targetCarbs: user.targetCarbs,
      targetFats: user.targetFats
    });

    res.json({
      message: 'Stats updated successfully',
      user: {
        id: user._id,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activityLevel,
        goalWeight: user.goalWeight,
        targetCalories: user.targetCalories,
        targetProtein: user.targetProtein,
        targetCarbs: user.targetCarbs,
        targetFats: user.targetFats
      }
    });
  } catch (error) {
    console.error('Update user stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

