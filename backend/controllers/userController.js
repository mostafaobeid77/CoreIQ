const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -profilePhoto') // Exclude heavy photo field
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if photo exists (lightweight)
    const photoCheck = await User.exists({ _id: req.userId, profilePhoto: { $exists: true, $ne: null } });
    if (photoCheck) {
      // Add cache buster based on updatedAt timestamp
      const timestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
      user.profilePhoto = `/api/users/${user._id}/photo?v=${timestamp}`;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Stream Profile Photo
exports.getProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Photo Service] Requesting photo for user: ${id}`);

    // Select ONLY profilePhoto to minimize memory usage
    const user = await User.findById(id).select('profilePhoto');

    if (!user || !user.profilePhoto) {
      return res.status(404).send('Photo not found');
    }

    // Cache for 24 hours (86400 seconds)
    // Client will re-fetch only if URL changes or cache expires
    res.set('Cache-Control', 'public, max-age=86400');

    // Handle Base64 string (Stored format: "data:image/jpeg;base64,.....")
    if (user.profilePhoto.startsWith('data:image')) {
      const matches = user.profilePhoto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return res.status(500).send('Invalid image data');
      }

      const type = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      res.set('Content-Type', type);
      res.send(buffer);
    } else {
      // If securely stored as URL (future proofing) or raw buffer? 
      // Assuming current storage is Base64 string.
      // Fallback: just send it if it's somehow raw bytes (unlikely with Mongoose String type)
      res.send(user.profilePhoto);
    }
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(404).send('Photo not found');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, username, email, profilePhoto, birthDate } = req.body;

    // Optimize: Don't load the heavy photo just to update text fields
    const user = await User.findById(req.userId).select('-profilePhoto');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;

    // Safety check: Only update photo if it's actual data, not a URL string
    // And allow clearing it if explicitly set to null (though frontend doesn't do that yet)
    if (profilePhoto && !profilePhoto.startsWith('http') && !profilePhoto.startsWith('/')) {
      user.profilePhoto = profilePhoto;
    }
    if (birthDate) user.birthDate = birthDate;

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

    // Recalculate targets if birthDate changed
    if (birthDate || user.weight > 0) {
      user.calculateNutritionTargets();
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // Optimize response: replace heavy base64 photo with URL
    if (userResponse.profilePhoto) {
      const timestamp = userResponse.updatedAt ? new Date(userResponse.updatedAt).getTime() : Date.now();
      userResponse.profilePhoto = `/api/users/${user._id}/photo?v=${timestamp}`;
    }

    res.json({ message: 'Profile updated successfully', user: userResponse });
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

