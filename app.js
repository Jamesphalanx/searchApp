var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http');
var querystring = require("querystring");

//Mongoose Init
var mongoose = require('mongoose');
//Socket Io Init
var server = require('http').Server(app);
var io = require('socket.io')(server);

console.log("Socket IO Server Connected");
server.listen(82);

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
var feedbackModel = require('./models/Feedback');

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
    if(searchObj.searchFilter.pdfName){
      var pdfparam = searchObj.searchFilter.pdfName;
    }else{
      var pdfparam = "";
    }
    var result = querystring.stringify({query: searchObj.searchInput, pdf:pdfparam});
    //call localhost 5000
    var options = {
      host: 'localhost',
      port: 5000,
      path: '/search_results?'+result,
      method: 'GET'
    };

    var req = http.get(options, function (response){
      var str = "";
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function () {
        var finalObj = JSON.parse(str);
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
        socket.emit('searchResults', finalObj);
      });
    });
    req.on('error', function (e){
      console.log(e);
      //push python connection error.
    });
  });

  //On Thumbs feedback
  socket.on('feedbackSend', function (feedbackObj){
    if(feedbackObj.oid){
      var updateBool = feedbackObj.data.feedback;
      feedbackModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(feedbackObj.oid)}, {$set:{feedback:updateBool}}, function (err){
        if (err) return console.error(err);
      });
    }else{
      //No object Id
      var insertFeedback = new feedbackModel(feedbackObj.data);
      insertFeedback.save(function (err, feedSaved) {
        if (err) return console.error(err);
        socket.emit('feedbackSaved', {id:feedbackObj.id, data:feedSaved});
      });
    }
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
