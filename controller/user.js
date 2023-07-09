const User = require('../model/usermodel');

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Post = require('../model/usersPost');

// CREATE operation
const createUser = async (req, res) => {
  try {
    const {
      name,
      user_id,
      password,
      email_id,
      user_name,
      gender,
      mobile,
      isProfilePublic,
    } = req.body

    // Check if the email already exists in the database
    const existingEmail = await User.findOne({ email_id })
    if (existingEmail) {
      return res
        .status(400)
        .send({ error: 'Email already exists', status: false })
    }

    // Check if the username already exists in the database
    const existingUsername = await User.findOne({ user_name })
    if (existingUsername) {
      return res
        .status(400)
        .send({ error: 'Username already exists', status: false })
    }

    // Check if the mobile number already exists in the database
    const existingMobile = await User.findOne({ mobile })
    if (existingMobile) {
      return res
        .status(400)
        .send({ error: 'Mobile number already exists', status: false })
    }

    const newUser = new User({
      name,
      user_id,
      password,
      email_id,
      user_name,
      gender,
      mobile,
      isProfilePublic,
    })

    await newUser.save()
    return res.status(201).send({ data: newUser, status: true })
  } catch (err) {
    console.log(err)
    res.status(400).send({ error: err, status: false })
  }
}

// READ operation
const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).lean();
      if (!user) {
        return res.status(404).send({ Message: "User not found", status:false,data:{}});
      }
      const postCount = await Post.countDocuments({ user: req.params.id });
      const totalFollowers = user.followers ? user.followers.length : 0;
      const totalFollowing = user.following ? user.following.length : 0;
      return res.status(200).send({
        message: "User details",
        status: true,
        data: { ...user, totalFollowers, totalFollowing,postCount },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Internal server error" });
    }
  }
  

// UPDATE operation
const updateUserById = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
        return res.status(200).send({data:updatedUser,status:true,message:"updated successfully."});
  } catch (err) {
    res.status(404).send({ error: err.message })
  }
}

// DELETE operation
const deleteUserById = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    return res.sendStatus(204)
  } catch (err) {
    res.status(404).send({ error: err.message })
  }
}
const loginUser = async (req, res) => {
  const { email_id, password } = req.body
  try {
    // Find the user by email
    const user = await User.findOne({ email_id }).lean()
    if (!user) {
      return res.status(401).json({ error: 'Invalid email.' })
    }
    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Wrong password' })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
      expiresIn: '1h',
    })

    // Return the token
   return res.status(200).send({
      message: 'login successfully.',
      status: true,
      data: { ...user, Auth: token },
    })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

// Follow a user
const followUser = async (req, res) => {
    try {
      const { userId, followUserId } = req.body;
  
      // Check if both users exist
      const user = await User.findById(userId);
      const followUser = await User.findById(followUserId);
      if (!user || !followUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user is already following the followUser
      if (user.following.includes(followUserId)) {
        return res.status(400).json({ error: 'User already followed' });
      }
  
      // Add followUser to user's following and user to followUser's followers, then save both users
      user.following.push(followUserId);
      followUser.followers.push(userId);
      await Promise.all([user.save(), followUser.save()]);
  
      return res.json({ message: 'User followed successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Unfollow a user
const unfollowUser = async (req, res) => {
    try {
      const { userId, unfollowUserId } = req.body;
  
      // Check if both users exist
      const user = await User.findById(userId);
      const unfollowUser = await User.findById(unfollowUserId);
      if (!user || !unfollowUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user is following the unfollowUser
      if (!user.following.includes(unfollowUserId)) {
        return res.status(400).json({ error: 'User is not being followed' });
      }
  
      // Remove unfollowUser from user's following and user from unfollowUser's followers, then save both users
      user.following = user.following.filter(id => id.toString() !== unfollowUserId);
      unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);
      await Promise.all([user.save(), unfollowUser.save()]);
  
      res.json({ message: 'User unfollowed successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
// Block a user
const blockUser = async (req, res) => {
    try {
      const { userId, blockUserId } = req.body;
  
      // Check if both users exist
      const user = await User.findById(userId);
      const blockUser = await User.findById(blockUserId);
      if (!user || !blockUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user is already blocked
      if (user.blockedUsers.includes(blockUserId)) {
        return res.status(400).json({ error: 'User already blocked' });
      }
  
      // Add blockUser to user's blockedUsers and save
      user.blockedUsers.push(blockUserId);
      await user.save();
  
      res.json({ message: 'User blocked successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Unblock a user
  const unblockUser = async (req, res) => {
    try {
      const { userId, unblockUserId } = req.body;
  
      // Check if both users exist
      const user = await User.findById(userId);
      const unblockUser = await User.findById(unblockUserId);
      if (!user || !unblockUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user is already not blocked
      if (!user.blockedUsers.includes(unblockUserId)) {
        return res.status(400).json({ error: 'User not blocked' });
      }
  
      // Remove unblockUser from user's blockedUsers and save
      user.blockedUsers = user.blockedUsers.filter(blockedUser => blockedUser.toString() !== unblockUserId);
      await user.save();
  
      res.json({ message: 'User unblocked successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  // Get post count for a user
const getPostCount = async (req, res) => {
    try {
      const userId = req.params.userId;
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ Message: 'User not found', status:false,data:{}});
      }
      // Count the posts for the user
      const postCount = await Post.countDocuments({ user: userId });
      return res.status(200).send({ message:"total postcount",status:true,postCount });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
module.exports = {
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  loginUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getPostCount
}
