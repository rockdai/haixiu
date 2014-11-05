var config = {
  mongodb_url: process.env.MONGOHQ_URL || 'mongodb://localhost/haixiu',
  port: process.env.PORT || 3000,
  douban_cookie: 'viewed="3590768_1016272"; ll="108296"; bid="hWcTdvDyOYI"; ct=y; _ga=GA1.2.1167184662.1412271513; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1415179087%2C%22https%3A%2F%2Fwww.google.com%2F%22%5D; __utmt=1; as="http://www.douban.com/"; dbcl2="105659582:Xb5v0vuj9OM"; ck="GKUf"; _pk_id.100001.8cb4=d9658059b6096e90.1412332268.27.1415180767.1415172287.; _pk_ses.100001.8cb4=*; push_noty_num=0; push_doumail_num=0; __utma=30149280.1167184662.1412271513.1415166517.1415179088.44; __utmb=30149280.29.10.1415179088; __utmc=30149280; __utmz=30149280.1415162297.42.25.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmv=30149280.10565',
};

exports = module.exports = config;
