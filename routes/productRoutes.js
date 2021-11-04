const express = require('express');

const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const bidController = require('../controllers/bidController');

const attachTheCurrentUser = require('../middlewares/attachTheCurrentUser');

const router = express.Router();

//Aliases
router.route('/all-products').get(
  authController.protect,
  authController.restrictTo('admin'),

  productController.getAllProducts
);

router
  .route('/brief')
  .get(productController.briefProducts, productController.getAllProducts);

// CRUD routes
router
  .route('/')
  .get(
    productController.onlyAvailableProducts,
    productController.getAllProducts
  )
  .post(
    authController.protect,
    authController.restrictTo('user'),
    attachTheCurrentUser,
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),

    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    productController.deleteProduct
  );

// User own resources 👤
router.route('/me/sellings').get(
  authController.protect,

  productController.mySellProducts
);

router.route('/me/purchase-history').get(
  authController.protect,

  productController.getPurchaseHistory
);

// BID System 💵
router
  .route('/:id/bids')
  .patch(
    authController.protect,

    bidController.bidProduct
  )
  .delete(authController.protect, bidController.deleteBid);

router.route('/bids/pending').get(
  authController.protect,

  bidController.getPendingBids
);
// Buyer can Get his confirmed bids by sellers
router.route('/bids/confirmedBids').get(
  authController.protect,

  bidController.getConfirmedBids
);

// Confirm a bid
router.route('/:id/bids/:targetId').patch(
  authController.protect,

  bidController.confirmBid
);

// Admin only

router.use(authController.protect, authController.restrictTo('admin'));
router
  .route('/super/all-pendings')
  .get(productController.getALlPendingsProducts);
router.route('/super/all-products').get(productController.getAllProducts);

module.exports = router;
