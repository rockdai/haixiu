var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var crawler = require('./crawler');
var model = require('./model');
var Post = model.Post;
var config = require('./config');
var moment = require('moment');

mongoose.connect(config.mongodb_url);

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

var cities = [
  {key: 'hangzhou', name: '浙江杭州'},
  {key: 'shanghai', name: '上海'},
  {key: 'beijing', name: '北京'},
  {key: 'chengdu', name: '四川成都'},
  {key: 'nanning', name: '广西南宁'},
  {key: 'changsha', name: '湖南长沙'}
];

app.get('/', function (req, res, next) {
  res.render('home', {cities: cities});
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

for (var i = 0; i < cities.length; i++) {
  (function (city) {
    app.get('/city/' + city.key, function (req, res, next) {
      Post.find({author_location: city.name}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
        if (err) {
          return next(err);
        }
        res.render('posts', {docs: docs});
      });
    });
  })(cities[i]);
}

// END 针对各个地域的 route 配置


// 启动爬虫
crawler.start();

app.listen(config.port, function () {
  console.log('app is listening at port 3000');
});
