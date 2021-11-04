const mongoose = require('mongoose');

const categoryScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],

      maxlength: [
        40,
        'A category name must have less or equal then  40 characters',
      ],
      minlength: [
        5,
        'A category name must have more or equal then  5 characters',
      ],
      // validate: [validator.isAlpha, 'Product name must only conatints characters'],
    },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categoryScheme.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });

  next();
});
categoryScheme.index({ name: 1 });
const Category = mongoose.model('Category', categoryScheme);

module.exports = Category;
