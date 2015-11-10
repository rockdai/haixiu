/**!
 * haixiu - app.js
 *
 */

'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const crawler = require('./crawler');
const model = require('./model');
const Post = model.Post;
const config = require('./config');

mongoose.connect(config.mongodb_url);

let app = express();
let hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    gaid: function () {
      return config.gaid;
    },
  },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

let cities = [
  {key: 'hangzhou', name: '浙江杭州'},
  {key: 'shanghai', name: '上海'},
  {key: 'beijing', name: '北京'},
  {key: 'chengdu', name: '四川成都'},
  {key: 'nanning', name: '广西南宁'},
  {key: 'changsha', name: '湖南长沙'},
  {key: 'changsanjiao', name: '长三角', names: [
    '浙江杭州', '浙江温州', '浙江宁波', '浙江台州',
    '浙江嘉兴', '浙江金华', '浙江绍兴', '浙江湖州',
    '浙江丽水', '浙江衢州', '浙江舟山', '上海', '江苏南京'
    ]
  },
  {key: 'guangzhou', name: '广东广州'},
  {key: 'shenzhen', name: '广东深圳'},
];

app.get('/', function (req, res, next) {
  res.render('home', {cities: cities});
});

// 针对各个地域的 route 配置

app.get('/all', function (req, res, next) {
  Post.find().sort({id: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    res.render('posts', {docs: docs});
  });
});

for (let i = 0; i < cities.length; i++) {
  (function (city) {
    let names = city.names || [city.name];
    app.get('/city/' + city.key, function (req, res, next) {
      Post.find({author_location: {$in: names}}).sort({id: -1}).limit(100).exec(function (err, docs) {
        if (err) {
          return next(err);
        }
        res.render('posts', {docs: docs});
      });
    });
  })(cities[i]);
}

// END 针对各个地域的 route 配置

// 某个用户的发帖
app.get('/author/:authorId', function (req, res, next) {
  const authorId = req.params.authorId;
  Post.find({author_id: authorId}).sort({id: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    let authorName = '';
    if (docs && docs.length) {
      // 取最近一条帖子的昵称
      authorName = docs[0].author_name;
    }
    res.render('author', {
      authorId: authorId,
      authorName: authorName,
      docs: docs,
    });
  });
});

// 启动爬虫
crawler.start();

let server = app.listen(config.port, function () {
  console.log('app is listening ' + server.address().port);
});
