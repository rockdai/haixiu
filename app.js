var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var crawler = require('./crawler');
var model = require('./model');
var Post = model.Post;
var config = require('./config');

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

function getDocsAuthorId(docs) {
  docs = docs || [];
  var reg = /http:\/\/www.douban.com\/group\/people\/(\w+)(\/)?/;
  for (var i = 0; i < docs.length; i++) {
    docs[i].authorId = reg.exec(docs[i].author_url)[1];
  }
  return docs;
}

// 针对各个地域的 route 配置

app.get('/all', function (req, res, next) {
  Post.find().sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    docs = getDocsAuthorId(docs);
    res.render('posts', {docs: docs});
  });
});

for (var i = 0; i < cities.length; i++) {
  (function (city) {
    var names = city.names || [city.name];
    app.get('/city/' + city.key, function (req, res, next) {
      Post.find({author_location: {$in: names}}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
        if (err) {
          return next(err);
        }
        docs = getDocsAuthorId(docs);
        res.render('posts', {docs: docs});
      });
    });
  })(cities[i]);
}

// END 针对各个地域的 route 配置

// 某个用户的发帖
app.get('/author/:authorId', function (req, res, next) {
  var authorId = req.params.authorId;
  var authorUrl = 'http://www.douban.com/group/people/' + authorId + '/';
  Post.find({author_url: authorUrl}).sort({create_at: -1}).limit(100).exec(function (err, docs) {
    if (err) {
      return next(err);
    }
    var authorName = '';
    if (docs && docs.length) {
      // 取最近一条帖子的昵称
      authorName = docs[0].author;
    }
    docs = getDocsAuthorId(docs);
    res.render('author', {
      authorName: authorName,
      authorUrl: authorUrl,
      docs: docs
    });
  });
});

// 启动爬虫
crawler.start();

var server = app.listen(config.port, function () {
  console.log('app is listening ' + server.address().port);
});
