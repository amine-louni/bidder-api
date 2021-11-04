const express = require('express');

const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

//const upload = require('../utils/multer');
//const uploadProdcutThumbnail = require('../middlewares/imageUploader');
const attachTheCurrentUser = require('../middlewares/attachTheCurrentUser');

const router = express.Router();
router.route('/').get(categoryController.getAllCateogries);

// Middleware to restricted to the admin only !
router.use(authController.protect);

router.use(authController.restrictTo('admin'));
router.route('/').post(attachTheCurrentUser, categoryController.createCategory);
router
  .route('/:id')
  .get(categoryController.getAllCateogries)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
