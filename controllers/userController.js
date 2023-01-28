const User = require('../models/userModel');
const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const Comment = require('../models/commentModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Follow A User
exports.followUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  // Check if the user to be followed exists
  const user = await User.findById(id);
  if (!user) {
    return next(
      new AppError('Invalid user id. Please provide a valid one', 400)
    );
  }

  // Follow the user - Increase the followed by count of the user to be followed
  const updatedFollowedBy = {
    counts: {
      follows: user.counts.follows,
      followed_by: user.counts.followed_by + 1,
    },
  };

  await User.findByIdAndUpdate(id, updatedFollowedBy, {
    new: true,
    runValidators: true,
  });

  // Increase the follows count of the user who is following
  const updatedFollows = {
    counts: {
      follows: req.user.counts.follows + 1,
      followed_by: req.user.counts.followed_by,
    },
  };

  await User.findByIdAndUpdate(req.user.id, updatedFollows, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: `You are now following ${user.full_name}.`,
  });
});

// Unfollow A User
exports.unfollowUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  // Check if the user to be unfollowed exists
  const user = await User.findById(id);
  if (!user) {
    return next(
      new AppError('Invalid user id. Please provide a valid one', 400)
    );
  }

  // Unfollow the user - Decrease the followed by count of the user to be unfollowed
  const updatedFollowedBy = {
    counts: {
      follows: user.counts.follows,
      followed_by: user.counts.followed_by - 1,
    },
  };

  await User.findByIdAndUpdate(id, updatedFollowedBy, {
    new: true,
    runValidators: true,
  });

  // Decrease the follows count of the user who is unfollowing
  const updatedFollows = {
    counts: {
      follows: req.user.counts.follows - 1,
      followed_by: req.user.counts.followed_by,
    },
  };

  await User.findByIdAndUpdate(req.user.id, updatedFollows, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: `You have unfollowed ${user.full_name}.`,
  });
});

// Get the current logged in user
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      'User Name': req.user.full_name,
      Followers: req.user.counts.followed_by,
      Following: req.user.counts.follows,
    },
  });
});

// Like a post
exports.likePost = catchAsync(async (req, res, next) => {
  // Check if the post exists
  const id = req.params.id;

  const post = await Post.findById(id);
  if (!post) {
    return next(new AppError('A post with that ID could not be found', 404));
  }

  // Check if the user has already liked the post
  const like = await Like.findOne({ user: req.user.id, post: id });

  if (!like) {
    // Create a new like for the post
    const newLike = await Like.create({
      user: req.user.id,
      post: id,
    });

    // Update the likes count and the data in the post
    const updatedLikes = {
      likes: {
        count: post.likes.count + 1,
        data: [...post.likes.data, newLike._id],
      },
    };

    await Post.findByIdAndUpdate(id, updatedLikes, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Liked successfully',
  });
});

// Unlike a post
exports.unlikePost = catchAsync(async (req, res, next) => {
  // Check if the post exists
  const id = req.params.id;

  const post = await Post.findById(id);
  if (!post) {
    return next(new AppError('A post with that ID could not be found', 404));
  }

  // Check if the user has already liked the post
  const like = await Like.findOne({ user: req.user.id, post: id });
  if (!like) {
    return next(new AppError('You have not liked this post', 400));
  }

  // Delete the like from likes collection
  await Like.deleteOne({ _id: like._id });

  // Update the likes count in post
  const updatedLikes = {
    likes: {
      count: post.likes.count - 1,
      data: [...post.likes.data],
    },
  };

  await Post.findByIdAndUpdate(id, updatedLikes, {
    new: true,
    runValidators: true,
  });

  // Remove the unliked likes data from the post
  await Post.findByIdAndUpdate(
    id,
    { $pull: { 'likes.data': like._id } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Unliked Successfully',
  });
});

// Comment on a post
exports.commentPost = catchAsync(async (req, res, next) => {
  // Check if the post exists
  const id = req.params.id;

  const post = await Post.findById(id);
  if (!post) {
    return next(new AppError('A post with that ID could not be found', 404));
  }

  // Check if the user has already commented on the post
  const comment = await Comment.findOne({ user: req.user.id, post: id });
  if (comment) {
    return next(new AppError('You have already commented on this post', 400));
  }

  // Create new comment
  req.body.user = req.user.id;
  req.body.post = id;
  const newComment = await Comment.create(req.body);

  // Update comments count and data in the post
  const updatedComments = {
    comments: {
      count: post.comments.count + 1,
      data: [...post.comments.data, newComment._id],
    },
  };

  await Post.findByIdAndUpdate(id, updatedComments, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'You have commented on this post',
  });
});
