var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var cheerio = require('cheerio');
var model = require('./model');
var Post = model.Post;
var eventproxy = require('eventproxy');
var config = require('./config');

var q = async.queue(function (task, callback) {
  var postInfo = task;
  var ep = new eventproxy();
  ep.fail(callback);

  // 如果帖子已经抓取过就不再抓取
  Post.findOne({url: postInfo.url}, ep.done(function (post) {
    if (post) {
      return ep.emit('got_author');
    }
    ep.emit('fetch_author');
  }));

  ep.all('fetch_author', function () {
    superagent.get(postInfo.author_url)
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
      .set('Cookie', config.douban_cookie)
      .end(ep.done(function (res) {
        if (res.status !== 200) {
          console.error(403, postInfo.author_url);
          ep.emit('got_author');
          return;
        }
        var $ = cheerio.load(res.text);
        var location = $('.loc').text().replace('常居: \n', '').trim();
        var post = new Post({
          url: postInfo.url,
          title: postInfo.title,
          imgs: postInfo.imgs,
          author: postInfo.author,
          author_url: postInfo.author_url,
          author_location: location,
        });
        post.save(ep.done(function () {
          console.log('got %s', postInfo.title);
          ep.emit('got_author');
        }));
      }));
  });

  ep.all('got_author', function () {
    callback();
  });
// 并发数
}, 1);

function fetchHaixiuzu() {
  var ep = new eventproxy();
  ep.fail(function (err) {
    console.error(err);
  });
  superagent.get('https://database.duoshuo.com/api/threads/listPosts.json?thread_key=haixiuzu&page=1&limit=100')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
    .set('Cookie', config.douban_cookie)
    .end(ep.done(function (res) {
      var json = JSON.parse(res.text);
      var parentPosts = json.parentPosts;
      for (var postId in parentPosts) {
        var postInfo =  parentPosts[postId];
        postInfo = JSON.parse(new Buffer(postInfo.message, 'base64'));
        q.push(postInfo, ep.done(function () {}));
      }
    }));
}

exports.start = function () {
  fetchHaixiuzu();

  // 每分钟运行一次
  setInterval(fetchHaixiuzu, 60 * 1000);
};
