/**!
 * haixiu - crawler.js
 *
 * Authors:
 *   rockdai <rockdai@qq.com>
 */

'use strict';

/**
 * Module dependencies.
 */
const Douban = require('./lib/douban');
const config = require('./config');
const model = require('./model');
const _ = require('lodash');
const co = require('co');

const DB = new Douban({
  apikey: config.apikey,
});

const Post = model.Post;

function onerror(err) {
  console.error(err.stack);
  console.log(err);
}

function fixImagesPath(imgs) {
  imgs = imgs || [];
  return imgs.map(function (img) {
    if (img && img.startsWith('https://')) {
      img = img.replace('https://', 'http://');
    }
    return img;
  });
}

function* handleTopic(topic) {
  topic = topic || {};
  let topicId = topic.id;
  let imgs = fixImagesPath(_.pluck(topic.photos, 'alt'));

  let doc = yield Post.findOne({id: topicId}).exec();
  if (doc) {
    let updates = {
      title: topic.title,
      imgs: _.union(imgs, doc.imgs),
      author_name: topic.authorInfo.name,
      author_url: topic.authorInfo.alt,
      author_location: topic.authorInfo.loc_name || '',
      update_at: new Date(),
    };
    return yield doc.update(updates).exec();
  }
  let post = new Post({
    id: topicId,
    url: `http://www.douban.com/group/topic/${topicId}/`,
    title: topic.title,
    imgs: imgs,
    author_id: topic.authorInfo.id,
    author_name: topic.authorInfo.name,
    author_url: topic.authorInfo.alt,
    author_location: topic.authorInfo.loc_name || '',
  });
  return yield post.save();
}

function fetchHaixiuzu() {
  co(function* () {
    for (let page = 1; page <= config.fetchPage; page++) {
      let topics = DB.groupTopic(config.groupName, page);
      for (let i = 0; i < topics.length; i++) {
        let topic = topics[i];
        topic.authorInfo = DB.user((topic.author || {}).id);
        yield handleTopic(topic);
      }
    }
  }).catch(onerror);
}

exports.start = function () {
  fetchHaixiuzu();

  // 每10分钟运行一次
  setInterval(fetchHaixiuzu, 10 * 60 * 1000);
};
