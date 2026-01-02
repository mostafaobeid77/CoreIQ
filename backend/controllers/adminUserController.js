const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const { limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query, {
      fullName: 1,
      username: 1,
      email: 1,
      createdAt: 1,
      gender: 1,
      weight: 1,
      height: 1,
      age: 1,
      activityLevel: 1,
      goalType: 1,
      goalWeight: 1,
      targetCalories: 1,
      targetProtein: 1,
      targetCarbs: 1,
      targetFat: 1,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    const totalUsers = await User.countDocuments();

    res.json({
      totalUsers,
      users,
    });
  } catch (error) {
    console.error('Admin list users error:', error.message);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};
