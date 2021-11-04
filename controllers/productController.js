const multer = require('multer');
const cron = require('node-cron');
const sharp = require('sharp');
const Product = require('../models/productModel');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

// Run the task every 2 minutes
cron.schedule('*/2 * * * *', async function () {
  await Product.updateMany(
    {
      deadDate: {
        $lte: new Date(),
      },
      expired: false,
    },
    { expired: true, closed: true }
  );
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files.thumbnail || !req.files.images) return next();
  console.log('files pass in===========================');
  console.log(req.files);
  // 1) Thumbnail image
  req.body.thumbnail = `product-${Date.now()}-thumbnail.jpeg`;
  await sharp(req.files.thumbnail[0].buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.thumbnail}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
exports.briefProducts = (req, res, next) => {
  req.query.fields = 'name, price,summary';
  next();
};
exports.onlyAvailableProducts = (req, res, next) => {
  req.query.closed = 'false';

  next();
};

exports.getAllProducts = handlerFactory.getAll(Product);
exports.getProduct = handlerFactory.getOne(Product);
exports.createProduct = handlerFactory.createOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product);
exports.deleteProduct = handlerFactory.deleteOne(Product);

// custom controllers

exports.mySellProducts = catchAsync(async (req, res, next) => {
  const apiFeats = new ApiFeatures(
    Product.find({ user: req.currentUser._id }),
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

exports.getALlPendingsProducts = catchAsync(async (req, res, next) => {
  const apiFeats = new ApiFeatures(
    Product.find({ bids: { $exists: true, $not: { $size: 0 } } }),
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

exports.getPurchaseHistory = catchAsync(async (req, res, next) => {
  const products = await Product.find({
    buyer: req.currentUser._id,
    sold: true,
  });

  return res.status(200).json({
    status: 'success',
    data: products,
  });
});

// Search
