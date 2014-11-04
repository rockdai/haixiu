var express = require('express');
var mongoose = require('mongoose');
var crawler = require('./crawler');
var model = require('./model');
var Post = model.Post;

var app = express();

app.get('/', function (req, res, next) {
  Post.find().sort({craete_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.send(docs);
  });
});


app.get('/hangzhou', function (req, res, next) {
  Post.find({author_location: '浙江杭州'}).sort({craete_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.send(docs);
  });
});

app.get('/beijing', function (req, res, next) {
  Post.find({author_location: '北京'}).sort({craete_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.send(docs);
  });
});



// 启动爬虫
crawler.start();

app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
