const express = require('express');
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const attachTheCurrentUser = require('../middlewares/attachTheCurrentUser');

const router = express.Router();

// Public routes
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    attachTheCurrentUser,
    reportController.createReport
  );

// Admin only routes
router.use(authController.protect, authController.restrictTo('admin'));
router.route('/').get(reportController.getAllReports);
router.route('/:id').delete(reportController.deleteReport);
module.exports = router;
