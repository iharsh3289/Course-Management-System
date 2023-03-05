var createError = require('http-errors');
var express = require('express');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session=require('express-session');
var logger = require('morgan');

var passport = require('passport');
var mysql_store = require('express-mysql-session')(session);
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var instructorRouter=require('./routes/instructor');
var studentRouter=require('./routes/student');
var sqlinjection = require('sql-injection');

const sendOTP_to_phone = require('./routes/sendOTP_to_phone');
const verify_otp = require('./routes/verifyOTP')
const sendOTP_to_email = require('./routes/sendOTP_to_email')




var app = express();
require('express-reverse')(app);

// view engine setup


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





//Injections
//app.use(sqlinjection);


app.use(expressValidator());

db_connection=require('./db');
var sessionStore = new mysql_store({
  expiration: 60 * 2000
}, db_connection);


app.use(session({
  secret: "fd34s@!@dfa453f3DF#$D&W",
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  

}));
app.use(passport.initialize());
app.use(passport.session());

  // passport.serializeUser(function(user, done) {
  // done(null, user.Instructor_id);
  // });
  //
  //
  // passport.deserializeUser(function(user, done) {
  // db_connection.query("select Instructor_id from  INSTRUCTOR where Instructor_id  =  ?",user,function(err,rows){
  //   done(err, rows[0]);
  // });
  // });
 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(flash(app));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/instructor',instructorRouter);
app.use('/student',studentRouter);

app.use('/', sendOTP_to_phone);
app.use('/', verify_otp);
app.use('/', sendOTP_to_email);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
