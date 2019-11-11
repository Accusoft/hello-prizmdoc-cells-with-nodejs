const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const createProxyRouteToCellsServer = require('./cellsServer/createProxyRouteToCellsServer');
const app = express();
const config = require('./config/loadConfig');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));

// Expose all of the files in the public directory as static assets which the
// browser can request. For example, for the file public/stylesheets/style.css,
// the browser can request /stylesheets/style.css.
app.use(express.static(path.join(__dirname, 'public')));

// Setup the proxy to the PrizmDoc Cells Server. The WorkbookControl will send
// all of its requests for workbook data to the /cells-server-proxy route and
// the proxy will forward those requests on to the PrizmDoc Cells Server. If you
// are using PrizmDoc Cloud, the proxy will also inject your API key before
// forwarding the request.
app.use(createProxyRouteToCellsServer('/cells-server-proxy', config.cellsServerBaseUrl, config.apiKey));

// Register the default route which will display an XLSX file with the
// WorkbookControl.
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res /*, next*/) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
