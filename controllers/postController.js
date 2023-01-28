const Post = require('../models/postModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Function to create new post
exports.createPost = catchAsync(async (req, res, next) => {
  // This post is created by the currently authenticated user
  req.body.user = req.user.id;

  const post = await Post.create(req.body);

  res.status(201).json({
    status: 'success',
    data: post, // Created Post
  });
});

// Function to get a single post
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'comments.data',
      select: '-user -post -created_at -__v',
    })
    .select('likes.count');

  if (!post) {
    return next(new AppError('A post with that ID could not be found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: post, // Found post
  });
});

// Function to get all posts of a user
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ user: req.user.id })
    .populate({
      path: 'comments.data',
      select: '-user -post -created_at -__v',
    })
    .sort('-created_at')
    .select('title description created_at comments likes.count -user');

  if (!posts) {
    return next(new AppError('There are no posts of this user', 404));
  }

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts, // Found all docs
  });
});

// Function to delete a post
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('A post with that ID could not be found', 404));
  }

  if (post.user._id != req.user.id) {
    return next(new AppError('This post is not created by you', 400));
  }

  await Post.deleteOne({ _id: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null, // Deleted Post
  });
});
