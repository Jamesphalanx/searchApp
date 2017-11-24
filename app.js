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
//csv
var fs = require('fs');
var csv = require('csv');
var parse = require('csv-parse');

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
var filedataModel = require('./models/FileData');

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

//Grab TSV file every 3 am.
var file = fs.createWriteStream("iris_to_negotech_extract.tab");
var options = {
  host: "proxy.prv",
  path: "http://negotech.labour.gc.ca/data/iris_to_negotech_extract.tab",
  headers: {
    Host: "negotech.labour.gc.ca"
  }
};
http.get(options, function(res) {
  res.pipe(file);
  res.on('end', function () {
    console.log('file download complete');
    //drop database.
    filedataModel.collection.drop();
    //read the file and insert to DB.
    var parser = parse({delimiter: '\t', quote:''});
    var input = fs.createReadStream('iris_to_negotech_extract.tab');
    parser.on('readable', function(){
      while(record = parser.read()){
        var tempData = {
          new_agreementnumber : record[0],
          new_effectivedate : record[1],
          new_expirydate : record[2],
          new_settlementdate : record[3],
          new_jurprov : record[4],
          new_jurisdictioncode : record[5],
          new_employeecount : record[6],
          new_naicscodeid_firsttwodigit : record[7],
          new_publicprivate : record[8],
          new_naicscodeid : record[9],
          new_summaryreportavailabilityindicator : record[10],
          new_province : record[11],
          new_provinceenglish : record[12],
          new_provincefrench : record[13],
          new_citynameenglish : record[14],
          new_citynamefrench : record[15],
          new_cityprovincenameenglish : record[16],
          new_cityprovincenamefrench : record[17],
          new_unionid : record[18],
          new_unionnameenglish : record[19],
          new_unionnamefrench : record[20],
          new_affiliationtext : record[21],
          new_unionacronymenglish : record[22],
          new_unionacronymfrench : record[23],
          new_noccodeid : record[24],
          new_name_e : record[25],
          new_name_f : record[26],
          new_companyofficialnameeng : record[27],
          new_companyofficialnamefra : record[28],
          new_currentagreementindicator: record[29]
        };
        var insertFileData = new filedataModel(tempData);
        insertFileData.save(function (err){
          if (err) return console.error(err);
        });
      }
    });
    parser.on('finish', function(){
      console.log('complete');
    });
    parser.on('error', function(err){
      console.log(err.message);
    });
    input.pipe(parser);
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
