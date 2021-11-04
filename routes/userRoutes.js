const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const checkForbiddenFields = require('../middlewares/checkForbiddenFields');

const router = express.Router();

router.get(
  '/firebase/auth',
  authController.protect,
  authController.createFirebaseToken
);
// Admin Routes
router.post('/super-login', authController.superLogin);

router.post('/signup', checkForbiddenFields, authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Middleware to protect the next routes
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.patch('/update-me', checkForbiddenFields, userController.updateMe);
router.get('/me', userController.getMe, userController.getUser);
router.delete('/delete-me', userController.deleteMe);
// Middleware to restricted to the admin only !
router.route('/:id').get(userController.getUser);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
