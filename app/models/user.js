var db = require('../config');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var userSchema = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true}
});

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
  .then(function(hash) {
    this.password = hash;
    next();
  });
});

var User = mongoose.model('User', userSchema);

User.comparePassword = function(attemptedPassword, password, callback) {
  bcrypt.compare(attemptedPassword, password, function(err, isMatch) {
    callback(isMatch);
  });
};

module.exports = User;
