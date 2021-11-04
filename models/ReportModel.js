const mongoose = require('mongoose');

const reportScheme = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'A report must have a description'],

      maxlength: [
        120,
        'A report description must have less or equal then  120 characters',
      ],
      minlength: [
        5,
        'A report  description must have more or equal then  5 characters',
      ],
      // validate: [validator.isAlpha, 'Product name must only conatints characters'],
    },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
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

reportScheme.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });
  this.populate({
    path: 'product',
  });
  next();
});
reportScheme.index({ user: 1, product: 1 }, { unique: true });
const Report = mongoose.model('Report', reportScheme);

module.exports = Report;
