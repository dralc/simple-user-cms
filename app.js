var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/** @type {IDatasource}*/
const datasource = require(`./datasource/${process.env.SIM_DATASOURCE}`);
var usersRouter = require('./routes/users')(datasource);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


module.exports = {
  app,
  datasource,
};
