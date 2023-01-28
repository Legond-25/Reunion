const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A post must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the post'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    created_at: {
      type: String,
    },
    comments: {
      count: {
        type: Number,
        default: 0,
      },
      data: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Comment',
        },
      ],
    },
    likes: {
      count: {
        type: Number,
        default: 0,
      },
      data: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Like',
        },
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query Middleware - Pre hook
postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '_id full_name profile_picture counts',
  });

  next();
});

// Document Middleware - runs before .save() and .create()
// Format and save date in DB
postSchema.pre('save', function (next) {
  const date = new Date(Date.now());

  this.created_at = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;

  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
