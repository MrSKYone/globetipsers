var mongoose = require('mongoose');

module.exports = mongoose.model('Notif', {
  emitter_id: String,
  emitter_fcb_id: String,
  emitter_name: String,
  date: Date,
  type: String,
  receiver_id: String,
  received_fcb_id: String,
  receiver_name: String,
  status: String,
  url: String
});