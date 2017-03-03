var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}).then(function(links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  // var linkPromise = Promise.promisify(Link);
  Link.find({url: uri}).then(function(err, found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visits: 0
        });
        newLink.save(function(err, newLink) {
          if (err) {
            console.err(err);
          }
          res.status(200).send(newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username})
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        User.comparePassword(password, user.password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username})
    .then(function(user) {
      if (user.length < 1) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.find({code: req.url.substr(1)})
  .then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      Link.find({code: req.url.substr(1)})
        .then(function(link) {
          link.visit++;
          return res.redirect(link[0].url);
        });
    }
  });
};
