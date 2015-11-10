/**!
 * haixiu - config.js
 *
 */

'use strict';

/**
 * Module dependencies.
 */
let config = {
  mongodb_url: process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/haixiu',
  port: process.env.PORT || 27017,
  apikey: process.env.DB_APIKEY || '',
  groupName: 'haixiuzu',
  fetchPage: 20, // 抓取最新20页数据
};

exports = module.exports = config;
