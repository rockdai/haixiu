var config = {
  mongodb_url: process.env.MONGOHQ_URL || 'mongodb://localhost/haixiu',
  port: process.env.PORT || 3000,
};

exports = module.exports = config;
