var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db = require('./config/database')
var session = require('express-session')


db.connect().then((error)=>{
  if (error) console.log(`Database connection Error: ${error}`);
  else console.log('Database connected succesfully');
})

var studentRouter = require('./routes/student');
var tutorRouter = require('./routes/tutor');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs( {
  extname:'hbs',
  defaultLayout:'layout',
  layoutsDir: __dirname + '/views/layout',
  partialsDir: __dirname + '/views/partials/',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}))



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let sessionTime = new Date(Date.now() + (30 * 86400 * 1000))
app.use(session({secret:'key',resave:true, saveUninitialized:true, cookie:{maxAge:sessionTime}}))

app.use('/', studentRouter);
app.use('/tutor', tutorRouter);

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
