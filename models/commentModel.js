const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      trim: true,
      maxlength: [300, 'Maximum character limit reached'],
      minlength: [1, 'A comment must consist of atleast one character'],
      required: [true, 'Comment cannot be empty'],
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
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
commentSchema.index(
  { user: 1, post: 1 },
  {
    unique: true,
  }
);

// Query Middleware - pre hook
// Populate the foreign fields with the specified values
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'post',
    select: 'title description created_at',
  }).populate({
    path: 'user',
    select: 'full_name profile_picture',
  });

  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
