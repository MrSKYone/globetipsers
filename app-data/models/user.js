var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  public: Boolean,
  fcb_id: String,
  name: String,
  email: String,
  mdp: String,
  cover: String,
  avatar: String,
  friends: Array,
  pending_friend_requests: Array,
  user_friend_requests: Array,
  user_favorites: Array,
  tips: Array,
  last_connexion: Date,
  profil: {
    description: String,
    instagram: String,
    facebook: String,
    web: String,
    cover: String
  }
});