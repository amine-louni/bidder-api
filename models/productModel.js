const mongoose = require('mongoose');
const slugify = require('slugify');
const { secondsToDhms } = require('../utils/functions');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],

      maxlength: [
        40,
        'A Product name must have less or equal then  40 characters',
      ],
      minlength: [
        5,
        'A product name must have more or equal then  5 characters',
      ],
      // validate: [validator.isAlpha, 'Product name must only conatints characters'],
    },
    sold: {
      type: Boolean,
      default: false,
    },
    closed: {
      type: Boolean,
      default: false,
    },

    expired: {
      type: Boolean,
      default: false,
    },

    slug: String,
    buyer: { type: mongoose.Schema.ObjectId, ref: 'User' },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A product must have a user'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'A product must have a category'],
    },
    bids: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        amount: Number,
      },
    ],

    initialPrice: {
      type: Number,
      required: [true, 'A product must have an initial  price'],
      min: [100, 'A product must have an initial  price higher then 100'],
      max: [1000000, 'A product must have an initial  lower then 1000000'],
    },
    currentPrice: {
      type: Number,
      min: [100, 'A product must have a price higher then 100'],
      max: [1000000, 'A product must have a lower then 1000000'],
      default: function () {
        return this.initialPrice;
      },
    },
    deadDate: {
      type: Date,
      required: [true, 'A product must have a deadDate'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description'],
      maxlength: [
        500,
        'A Product name must have less or equal then  500 characters',
      ],
      minlength: [
        10,
        'A product name must have more or equal then  10 characters',
      ],
    },
    thumbnail: {
      type: String,
      required: [true, 'A product must have a thumbnail'],
    },

    images: {
      type: [String],
      required: [true, 'A product must have at least one image'],
    },
    cloudinary_id: {
      type: String,
    },
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

// INDEXING FIELDS ( it may takes some time !)
//productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

// VIRTUAL PROPS (Not included in database only output)

productSchema.virtual('leftTimeFormat').get(function () {
  const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
  const res = secondsToDhms(diff);
  return res.format;
});

productSchema.virtual('leftTimeInDays').get(function () {
  const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
  const res = secondsToDhms(diff);
  return res.days;
});
// productSchema.virtual('timeUp').get(function () {
//   const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
//   const res = secondsToDhms(diff);
//   return res.timeUp;
// });
productSchema.virtual('leftTimeInHours').get(function () {
  const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
  const res = secondsToDhms(diff);
  return res.hours;
});

productSchema.virtual('leftTimeInMinutes').get(function () {
  const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
  const res = secondsToDhms(diff);
  return res.minutes;
});

productSchema.virtual('leftTimeInSeconds').get(function () {
  const diff = (new Date(this.deadDate).getTime() - Date.now()) / 1000;
  const res = secondsToDhms(diff);
  return res.seconds;
});
// // Virtual populating
// productSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'product',
//   localField: '_id',
// });

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });
  this.populate({
    path: 'category',
  });
  this.populate({
    path: 'bids.user',
  });
  this.populate({
    path: 'buyer',
  });

  next();
});

// Doc Middlewares run with  save()  and create()  ( pre for before and post for after )
productSchema.pre('save', function (next) {
  // 'this' point to the doc instance
  this.slug = slugify(this.name, { lower: true }).toLowerCase();
  // this.currentPrice = this.get('initialPrice');
  next();
});
// Query Middleware
productSchema.pre(/^find/, function (next) {
  // 'this' point to the current query

  this.populate({
    path: 'bids',
    select: '-__v',
  });
  next();
});
productSchema.index({ name: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
