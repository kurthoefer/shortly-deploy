var db = require('../config');
var mongoose = require('mongoose');
var crypto = require('crypto');

var urlSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});

var createCode = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0,5);
};

urlSchema.pre('save', function(next){
  this.code = createCode(this.url);
  next();
});

var Link = mongoose.model('Link', urlSchema);

module.exports = Link;
