const Post = require('../model/usersPost')
const User = require('../model/usermodel')

// CREATE operation
const createPost = async (req, res) => {
  try {
    const { userId, text, media, public, hashtags, friendTags } = req.body

    // Check if the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
    }

    const newPost = await Post.create({
      user: userId,
      text,
      media,
      public,
      hashtags,
      friendTags,
    })

    res
      .status(201)
      .send({ message: 'post details', status: true, data: newPost })
  } catch (err) {
    res.status(400).send({ error: err.message, status: false })
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
      return res.status(404).send({ error: 'Post not found' })
    }
    res.send({ message: 'post details', status: true, data: post })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

// UPDATE operation
const updatePostById = async (req, res) => {
  try {
    const { userId, text, media, public, hashtags, friendTags } = req.body
    // Check if the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).send({ error: 'User not found' })
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
      return res.status(404).send({ error: 'Post not found' })
    }

    res.send({
      message: 'Record Updated successfully.',
      status: true,
      data: updatedPost,
    })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

// DELETE operation
const deletePostById = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id)
    if (!deletedPost) {
      return res.status(404).send({ error: 'Post not found' })
    }
    return res.status(204).send({ message: 'Post deleted', status: true })
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
}

// Like a post
const likePost = async (req, res) => {
  try {
    const { userId, postId } = req.body

    // Check if the post exists
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likes.some(
      (like) => like.user.toString() === userId,
    )
    if (alreadyLiked) {
      return res.status(400).json({ error: 'Post already liked' })
    }

    // Add the user to the post's likes and save
    await Post.findByIdAndUpdate(postId, { $push: { likes: { user: userId } } })

    res.json({ message: 'Post liked successfully', status: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get list of users who liked a post
const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.postId

    // Find the post
    const post = await Post.findById(postId).populate(
      'likes.user',
      'name user_name email_id',
    )
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
    const userId = req.params.userId // Assuming you have the current user's ID
    // Find the user to check their liked posts
    const currentUser = await User.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }
     // Get the array of blocked user IDs
     const blockedUsers = currentUser.blockedUsers || [];
    // Find the latest uploaded public posts
    const posts = await Post.find({
      public: true,
      user: { $in: blockedUsers },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name user_name')
    // Prepare the response with like status for each post
    const postFeeds = posts.map((post) => {
      const isLiked = post.likes.some((like) => like.user.toString() === userId)
      return {
        post,
        isLiked,
      }
    })
    return res
      .status(200)
      .send({ message: 'all post', status: true, data: postFeeds })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createPost,
  getPostById,
  updatePostById,
  deletePostById,
  likePost,
  getPostLikes,
  getPostFeeds,
}
