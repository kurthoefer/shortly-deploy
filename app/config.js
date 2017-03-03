var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortlydb');

var db = mongoose.connection;
db.on('error', function(){}); //console.error.bind(console, 'connection error:')
db.once('open', function() {
  console.log('connection SUCCESSFUL!');
});

module.exports = db;
