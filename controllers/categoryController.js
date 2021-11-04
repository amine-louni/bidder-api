const Category = require('../models/categoryModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');
const handlerFactory = require('./handlerFactory');

exports.getAllCateogries = handlerFactory.getAll(Category);
exports.getCategory = handlerFactory.getOne(Category);

// Restricted to Admin
exports.createCategory = handlerFactory.createOne(Category);
exports.updateCategory = handlerFactory.updateOne(Category);
exports.deleteCategory = handlerFactory.deleteOne(Category);
