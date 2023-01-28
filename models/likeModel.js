const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must belong to a user'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'A comment must belong to a post'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create index on schema
likeSchema.index(
  { user: 1, post: 1 },
  {
    unique: true,
  }
);

// Query Middleware - pre hook
likeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'post',
    select: 'title description created_at',
  }).populate({
    path: 'user',
    select: 'full_name profile_picture',
  });

  next();
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
