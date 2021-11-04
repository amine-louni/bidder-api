const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
const firebaseApp = require('../firebase/firebase.config');
// MIDDLEWARES FOR ALIAS ROUTES

// Bid System 💰

// Buyer  Actions
exports.bidProduct = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  const { id } = req.params;
  // GET THE ID
  const doc = await Product.findById(id);
  if (!doc) {
    return next(new AppError('no document found with that id', 404));
  }

  // CHECK IF HE IS NOT THE OWNER
  if (req.currentUser._id.equals(doc.user._id)) {
    return next(new AppError('You can not bid your own products', 401));
  }

  // check if sold
  if (doc.sold || doc.closed || doc.banned) {
    return next(
      new AppError(
        `You can't confirm  bid of a  non available product ${doc.name}`,
        401
      )
    );
  }
  // CHECK THE AMOUNT+100 >= CurrentPrice || Initial Price
  if (amount < doc.currentPrice + 100) {
    return next(
      new AppError(
        `bid amount must be hiegher then the current price at least ${
          doc.currentPrice + 100
        }`,
        401
      )
    );
  }

  // check if the product is already bidded by the user
  const bidIndex = doc.bids.findIndex((bid) => {
    return bid.user._id.toString() === req.currentUser._id.toString();
  });

  if (bidIndex >= 0) {
    // if it already in the biiders list update the amount

    doc.bids[bidIndex].amount = amount;
  } else {
    // add the user to the biddrse
    doc.bids.unshift({ user: req.currentUser._id, amount: amount });
  }

  // update current price
  doc.currentPrice = amount;

  await doc.save();

  firebaseApp
    .firestore()
    .collection('notifications')
    .add({
      read: false,
      text: `${doc.name} has received  a bid with ${amount} from  ${req.currentUser.firstName} ${req.currentUser.lastName}`,
      user: doc.user._id.toString(),
      link: `products/${doc._id}`,
      timestamp: Date.now(),
    });
  return res.status(201).json({
    status: 'success',
    data: doc.bids,
  });
});

exports.getPendingBids = catchAsync(async (req, res, next) => {
  const apiFeats = new ApiFeatures(
    Product.find({ 'bids.user': req.currentUser._id }),
    req.query
  )
    .filter()
    .sort()
    .selectFields();

  //EXECUTE QUERY
  const docs = await apiFeats.mongoQuery;

  return res.status(200).json({
    status: 'success',

    data: docs,
  });
});

exports.deleteBid = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError(`This product is not available`, 404));
  }
  const bidIndex = product.bids.findIndex((bid) => {
    return bid.user._id.toString() === req.currentUser._id.toString();
  });

  let filteredBids;
  if (bidIndex >= 0) {
    // if we have it we filter it and remove it from the array
    filteredBids = product.bids.filter(
      (bid) => !bid.user._id.toString() === req.currentUser._id.toString()
    );
    product.bids = filteredBids;
  } else {
    // if we don't we raise an error
    return next(
      new AppError(`You don't have a bid on this product ${product.name}`, 401)
    );
  }

  await product.save();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getConfirmedBids = catchAsync(async (req, res, next) => {
  const docs = await Product.find({ buyer: req.currentUser._id });

  return res.status(200).json({
    status: 'success',

    data: docs,
  });
});

// Seller Actions
exports.confirmBid = catchAsync(async (req, res, next) => {
  const { targetId, id } = req.params;

  // GET THE ID
  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('no document found with that id', 404));
  }
  // Check if the current user is the owner
  if (product.user._id.toString() !== req.currentUser._id.toString()) {
    return next(
      new AppError(`You don't own this product ${product.name}`, 401)
    );
  }
  // check if sold
  if (product.sold || product.closed || product.banned) {
    return next(
      new AppError(
        `You can't confirm  bid of a  non available product ${product.name}`,
        401
      )
    );
  }

  // Check if the targetUser is a bidder
  const bidIndex = product.bids.findIndex((bid) => {
    return bid.user._id.toString() === targetId;
  });

  if (bidIndex < 0) {
    return next(
      new AppError(
        `The target user is not a bidder of this product ${product.name}`,
        401
      )
    );
  }

  product.closed = true;
  product.buyer = targetId;

  const doc = await product.save();

  firebaseApp
    .firestore()
    .collection('notifications')
    .add({
      read: false,
      text: `Your bid has been accepted by ${req.currentUser.firstName}${req.currentUser.lastName} on ${product.name}`,
      user: targetId,
      link: `products/${doc._id}`,
      timestamp: Date.now(),
    });
  return res.status(201).json({
    status: 'success',
    data: doc,
  });
});
