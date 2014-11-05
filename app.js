var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var crawler = require('./crawler');
var model = require('./model');
var Post = model.Post;
var config = require('./config');
var moment = require('moment');

var app = express();
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    gaid: function () {
      return config.gaid;
    },
  },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', function (req, res, next) {
  res.render('home');
});

// 针对各个地域的 route 配置

app.get('/all', function (req, res, next) {
  Post.find().sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});

app.get('/hangzhou', function (req, res, next) {
  Post.find({author_location: '浙江杭州'}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});

app.get('/chengdu', function (req, res, next) {
  Post.find({author_location: '四川成都'}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});

app.get('/beijing', function (req, res, next) {
  Post.find({author_location: '北京'}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});

app.get('/nanning', function (req, res, next) {
  Post.find({author_location: '广西南宁'}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});
// END 针对各个地域的 route 配置



// 启动爬虫
crawler.start();

app.listen(config.port, function () {
  console.log('app is listening at port 3000');
});
