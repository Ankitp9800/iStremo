const router = require("express").Router();

const Users = require("../controller/user");
const postController = require("../controller/posts");

router.post("/register",Users.createUser);
router.get("/user/:id",Users.getUserById);
router.put("/user/:id",Users.updateUserById);
router.post("/login",Users.loginUser);
router.post('/users/follow', Users.followUser);
router.post('/users/unfollow', Users.unfollowUser);
router.post('/users/block', Users.blockUser);
router.post('/users/unblock', Users.unblockUser);
router.get('/users/:userId/posts/count', Users.getPostCount); 

// Post Routes
router.post('/posts', postController.createPost);
router.get('/posts/:id', postController.getPostById);
router.put('/posts/:id', postController.updatePostById);
router.delete('/posts/:id', postController.deletePostById);
router.post('/posts/like', postController.likePost);
router.get('/posts/:postId/likes', postController.getPostLikes); 
router.get('/posts/feeds/:userId', postController.getPostFeeds); 
router.get('/posts/liked/:userId',postController.getLikedPosts);





module.exports = router
