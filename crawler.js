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

function* handleTopic(topic) {
  topic = topic || {};
  let topicId = topic.id;
  let imgs = _.pluck(topic.photos, 'alt');

  let exists = yield Post.findOne({id: topicId}).exec();
  if (exists) {
    imgs = _.union(imgs, exists.imgs);
  }
  let post = {
    id: topicId,
    url: `http://www.douban.com/group/topic/${topicId}/`,
    title: topic.title,
    imgs: imgs,
    author_id: topic.authorInfo.id,
    author_name: topic.authorInfo.name,
    author_url: topic.authorInfo.alt,
    author_location: topic.authorInfo.loc_name || '',
    update_at: new Date(),
  };
  return yield Post.update({id: topicId}, post, {upsert: true}).exec();
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
