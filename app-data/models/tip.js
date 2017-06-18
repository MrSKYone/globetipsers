var mongoose = require('mongoose');

module.exports = mongoose.model('Tip', {
  display: Boolean,
  author_id: String,
  author: String,
  name: String,
  category: String,
  continent: String,
  country: String,
  city: String,
  address: String,
  lat: String,
  lon: String,
  text: String,
  cover: String
});