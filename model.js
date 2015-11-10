/**!
 * haixiu - model.js
 *
 */

'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PostSchema = new Schema({
  id: String,
  url: String,
  title: String,
  imgs: [String],
  author_id: String,
  author_name: String,
  author_url: String,
  author_location: String,
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

PostSchema.index({id: -1}, { unique: true });
PostSchema.index({create_at: -1});

let Post = mongoose.model('Post', PostSchema);

exports.Post = Post;
