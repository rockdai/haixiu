/**!
 * haixiu - douban.js
 *
 * Authors:
 *   rockdai <rockdai@qq.com>
 */

'use strict';

/**
 * Module dependencies.
 */
const querystring = require('querystring');
const request = require('urllib-sync').request;

const API_ROOT = 'https://api.douban.com/v2';

/**
 * Expose `Client`
 */

module.exports = Client;

function Client(options) {
  if (!(this instanceof Client)) {
    return new Client(options);
  }

  options = options || {};
  this.apikey = options.apikey;
  this.timeout = options.timeout || 30000;
}

Client.prototype.getUrl = function(path, query) {
  let result = API_ROOT + path;
  query = query || {};
  if (this.apikey) {
    query.apikey = this.apikey;
  }
  result = result + '?' + querystring.stringify(query);
  return result;
};

Client.prototype.request = function (url, args) {

  args = args || {};
  args.timeout = this.timeout;

  let result = request(url, args);

  let body = result.data.toString();
  let status = result.status;
  let headers = result.headers;
  if (status.toString()[0] !== '2') {
    let err = new Error('Request Douban API error.');
    err.name = 'RequestDoubanAPIError';
    err.statusCode = status;
    err.originHeaders = headers;
    err.originBody = body;
    throw err;
  }
  let jsonBody;
  try {
    jsonBody = JSON.parse(body);
  } catch (ex) {
    ex.name = 'ParseDoubanAPIFailed';
    ex.statusCode = status;
    ex.originHeaders = headers;
    ex.originBody = body;
    throw ex;
  }
  return jsonBody;
};

Client.prototype.user = function (userId) {
  let url = this.getUrl(`/user/${userId}`);
  let body = this.request(url);
  return body;
};

Client.prototype.groupTopic = function (groupName, page) {
  page = page || 1;
  let start = (page - 1) * 20;
  let url = this.getUrl(`/group/${groupName}/topics`, {
    start: start,
  });
  let body = this.request(url);
  let topics = body.topics || [];
  return topics;
};
