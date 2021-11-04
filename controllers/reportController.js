const Report = require('../models/ReportModel');

const handlerFactory = require('./handlerFactory');

// for publuc
exports.createReport = handlerFactory.createOne(Report);

// for admin only

exports.getAllReports = handlerFactory.getAll(Report);
exports.getReport = handlerFactory.getOne(Report);
exports.deleteReport = handlerFactory.deleteOne(Report);
