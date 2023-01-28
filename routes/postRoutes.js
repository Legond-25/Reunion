const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/', postController.createPost);
router.get('/all_posts', postController.getAllPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .delete(postController.deletePost);

module.exports = router;
