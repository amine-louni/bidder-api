const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter;

    if (req.params.productId) filter = { product: req.params.productId };
    const apiFeats = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .selectFields()
      .paginate()
      .search();

    //EXECUTE QUERY
    const docs = await apiFeats.mongoQuery;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      req_at: req.requestedTime,
      data: {
        docs,
      },
    });
  });
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('no document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.body, 'body in create one');
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('no doc found with that id', 404));
    }

    // Check if the patcher has admin role or the owner of the doc
    if (
      req.currentUser._id.toString() !== doc.user._id.toString() &&
      req.currentUser.role !== 'admin'
    ) {
      return next(new AppError("You don't have the permisson to edit", 403));
    }

    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(201).json({
      status: 'success',
      data: updatedDoc,
    });
  });
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.deleteOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (!doc) {
      return next(new AppError('no document found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
