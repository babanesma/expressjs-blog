// Main Variables
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const expressSession = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const manifestHelpers = require('express-manifest-helpers');
// import manifestHelpers from 'express-manifest-helpers';

// connect to database
mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => 'You are now connected to Mongo!')
    .catch(err => console.error('Something went wrong', err))

// Express App
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = req.flash();
    res.locals.userLoggedIn = req.session.userId || false
    next();
});
app.use(fileUpload());
app.use(manifestHelpers.default({
    manifestPath: __dirname + '/public/build/rev-manifest.json'
}));

// Routers
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));
app.use('/pages', require('./src/routes/pages'));
app.use('/auth', require('./src/routes/auth'));
app.use('/posts', require('./src/routes/posts'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
