const Post = require('../model/usersPost')
const User = require('../model/usermodel')


// CREATE operation
const createPost = async (req, res) => {
  try {
    const { userId, text, public, hashtags, friendTags } = req.body

    // Check if the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res
        .status(404)
        .send({ Message: 'User not found', status: false, data: {} })
    }
    console.log("req",req.body);
    const { filename } = req.file;
    const newPost = await Post.create({
      user: userId,
      text,
      media:`http://localhost:8080/assets/${filename}`,
      public,
      hashtags,
      friendTags,
    })

    return res
      .status(201)
      .send({ message: 'post details', status: true, data: newPost })
  } catch (err) {
    return res.status(400).send({ error: err.message, status: false })
  }
}



// READ operation
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'user',
      select: '_id name username email_id user_name user_id',
    })
    if (!post) {
      return res
        .status(404)
        .send({ Message: 'Post not found', status: false, data: {} })
    }
    return res
      .status(200)
      .send({ message: 'post details', status: true, data: post })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

// UPDATE operation
const updatePostById = async (req, res) => {
  try {
    const { userId, text, media, public, hashtags, friendTags } = req.body
    // Check if the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res
        .status(404)
        .send({ Message: 'User not found', status: false, data: {} })
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        user: userId,
        text,
        media,
        public,
        hashtags,
        friendTags,
      },
      { new: true },
    )

    if (!updatedPost) {
      return res
        .status(404)
        .send({ Message: 'Post not found', status: false, data: {} })
    }

    return res.status(200).send({
      message: 'Record Updated successfully.',
      status: true,
      data: updatedPost,
    })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

// DELETE operation
const deletePostById = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id)
    if (!deletedPost) {
      return res
        .status(404)
        .send({ Message: 'Post not found', status: false, data: {} })
    }
    return res.status(204).send({ message: 'Post deleted', status: true })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

// Like a post
const likePost = async (req, res) => {
  try {
    const { userId, postId } = req.body

    // Check if the post exists
    const post = await Post.findById(postId)
    if (!post) {
      return res
        .status(404)
        .json({ Message: 'Post not found', status: false, data: {} })
    }
    // Check if the user already liked the post
    const alreadyLiked = post.likes.some(
      (like) => like.user.toString() === userId,
    )
    if (alreadyLiked) {
      return res.status(400).json({ Message: 'Post already liked' })
    }

    // Add the user to the post's likes and save
    await Post.findByIdAndUpdate(postId, { $push: { likes: { user: userId } } })

    return res
      .status(200)
      .send({ message: 'Post liked successfully', status: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Get list of users who liked a post
const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.postId
    const page = req.query.page || 1 // Retrieve the page number from the query parameter (default: 1)
    const limit = 10 // Number of likes to display per page
    const offset = (page - 1) * limit // Calculate the offset based on the page number

    // Find the post and retrieve the likes with pagination
    const post = await Post.findById(postId)
      .populate({
        path: 'likes.user',
        select: 'name user_name email_id',
        options: {
          skip: offset,
          limit: limit
        }
      })
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    // Extract the user details from the populated likes
    const likes = post.likes.map((like) => like.user)
    return res
      .status(200)
      .send({ message: 'post likes', status: true, data: likes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get latest uploaded public posts with like status
const getPostFeeds = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    // Find the user to check their liked posts and blocked users
    const currentUser = await User.findById(userId).populate('blockedUsers');
    if (!currentUser) {
      return res.status(404).json({ Message: 'User not found', status: false, data: {} });
    }

    // Get an array of blocked user IDs
    const blockedUserIds = currentUser.blockedUsers.map(user => user._id);

    // Find the user's own posts
    const userPosts = await Post.find({ user: userId });

    // Calculate the skip value based on the requested page and number of posts per page
    const skip = (page - 1) * perPage;

    // Find the public posts from users not in the blocked user list and excluding the user's own posts, then sort them by the latest ones
    const postsCount = await Post.countDocuments({
      public: true,
      user: { $nin: blockedUserIds },
      _id: { $nin: userPosts.map(post => post._id) }
    });
    const totalPages = Math.ceil(postsCount / perPage);

    // Fetch the paginated posts
    const posts = await Post.find({
      public: true,
      user: { $nin: blockedUserIds },
      _id: { $nin: userPosts.map(post => post._id) }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate('user', 'name user_name');

    const totalCount = posts.length;

    return res.status(200).json({
      Message: 'Post feeds.',
      status: true,
      currentPage: page,
      totalPages,
      totalCount,
      data: posts
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get posts liked by a user
const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ Message: 'User not found', status: false, data: {} });
    }

    // Find the posts liked by the user
    const likedPosts = await Post.find({ 'likes.user': userId }).populate('user', 'name user_name');

    return res.status(200).json({ Message: 'Posts liked by the user.', status: true, data: likedPosts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPost,
  getPostById,
  updatePostById,
  deletePostById,
  likePost,
  getPostLikes,
  getPostFeeds,
  getLikedPosts
}
