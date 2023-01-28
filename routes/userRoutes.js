const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/authenticate', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.post('/follow/:id', userController.followUser);
router.post('/unfollow/:id', userController.unfollowUser);
router.get('/user', userController.getMe);

router.post('/like/:id', userController.likePost);
router.post('/unlike/:id', userController.unlikePost);
router.post('/comment/:id', userController.commentPost);

module.exports = router;
