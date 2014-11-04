var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/haixiu');

var PostSchema = new Schema({
  url: String,
  title: String,
  imgs: [String],
  author: String,
  author_url: String,
  author_location: String,
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

PostSchema.index({create_at: -1});

var Post = mongoose.model('Post', PostSchema);

exports.Post = Post;
