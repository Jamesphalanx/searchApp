var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.cookie('cookie', 'fileDownload=true; path=/')
  res.render('index', { title: 'Search' });
});

module.exports = router;
