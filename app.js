var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

//Mongoose Init
var mongoose = require('mongoose');
//Socket Io Init
var server = require('http').Server(app);
var io = require('socket.io')(server);

console.log("Socket IO Server Connected");
server.listen(81);

//Mongoose DB connection
mongoose.connect('mongodb://localhost/searchApp', { useMongoClient: true, promiseLibrary: global.Promise });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


var autoCompleteSearch = require('./models/Search');

io.on('connection', function (socket) {
  //autocomplete
  socket.on("autoCompleteAttempt", function (searchObj){
    autoCompleteSearch.find({searchStr: {$regex:'.*'+searchObj.searchInput+'.*'}}, null, {limit:5, sort:{selectedNum:-1}}, function (err, data){
      //return autocomplete list
      socket.emit('autoComplete', data);
    });
  });
  //autocomplete selected
  socket.on('autoCompleteSelected', function (selectedObj){
    autoCompleteSearch.findOneAndUpdate({_id:mongoose.Types.ObjectId(selectedObj.selectedId)}, {$inc:{selectedNum:1}}, function (err){
      if (err) return console.error(err);
    });
  });

  //On Search
  socket.on('searchAttempt', function (searchObj){
    //TEMP API callback
    var sampleJSON = {
      query : "",
      answers : [
        {passage:searchObj.searchInput, pdf_link:"imatestpdflink.pdf"},
        {passage:"I'm a test passage", pdf_link:"location/location/pdf.pdf"},
        {passage:"Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Nulla Lacinia, Urna Quis Pharetra Facilisis, Arcu Augue Pharetra Ligula, Ac Laoreet Mauris Nulla Eu Magna. Morbi Luctus Ex Eget Pellentesque Pretium. Fusce At Quam Orci. Etiam Sapien Purus, Cursus Ut Elit Sed, Faucibus Convallis Nibh. Proin Tincidunt, Diam Et Aliquet Dictum, Neque Dui Faucibus Neque, Id Bibendum Elit Eros Sed Metus. Aliquam Sodales Facilisis Odio, Non Placerat Neque Tincidunt Non. Pellentesque Non Diam In Tortor Dignissim Tincidunt. Praesent Luctus Vel Quam Non Tempus. Morbi At Imperdiet Lacus. Duis Ultrices Facilisis Arcu At Luctus. Maecenas Hendrerit Pulvinar Diam, Nec Rutrum Elit Sodales Finibus. Quisque Mattis Est At Nisi Bibendum Imperdiet. Maecenas Cursus, Ipsum At Pretium Cursus, Enim Ante Vulputate Nulla, Ac Facilisis Lectus Diam Quis Mauris.", pdf_link:"I'm a pdf link"}
      ]
    };

    //Save search string to DB.
    autoCompleteSearch.find({searchStr: searchObj.searchInput}, function (err, data){
      if (err) return console.error(err);
      if(data.length == 0){
        var insertSearch = new autoCompleteSearch({searchStr: searchObj.searchInput, selectedNum: 0});
        insertSearch.save(function (err, searchSaved) {
          if (err) return console.error(err);
        });
      }
    });

    //return serach results
    socket.emit('searchResults', sampleJSON);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
