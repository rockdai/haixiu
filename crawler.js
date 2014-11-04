var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var cheerio = require('cheerio');
var model = require('./model');
var Post = model.Post;

var q = async.queue(function (task, callback) {
  var postInfo = task;
  superagent.get(postInfo.author_url)
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
    .end(function (err, res) {
      if (err) {
        return callback(err);
      }
      var $ = cheerio.load(res.text);
      var location = $('.loc').text().replace('常居: \n', '').trim();
      if (location) {
        Post.findOne({url: postInfo.url}).exec(function (err, post) {
          if (err) {
            return callback(err);
          }
          if (!post) {
            postInfo.author_location = location;
            post = new Post({
              url: postInfo.url,
              title: postInfo.title,
              imgs: postInfo.imgs,
              author: postInfo.author,
              author_url: postInfo.author_url,
              author_location: location,
            });
            post.save();
          }
        });
      }
      callback(null);
    });
}, 3);

function fetchHaixiuzu() {
  superagent.get('https://database.duoshuo.com/api/threads/listPosts.json?thread_key=haixiuzu&page=1&limit=10')
    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
    .end(function (err, res) {
      if (err) {
        return console.error(err);
      }
      var json = JSON.parse(res.text);
      var parentPosts = json.parentPosts;
      for (var postId in parentPosts) {
        var postInfo =  parentPosts[postId];
        postInfo = JSON.parse(new Buffer(postInfo.message, 'base64'));
        q.push(postInfo, function (err) {
          return console.error(err);
        });
      }
    });
}

exports.start = function () {
  fetchHaixiuzu();

  // 每分钟运行一次
  setInterval(fetchHaixiuzu, 60 * 1000);
};
