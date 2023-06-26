const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  screenName: String,
  seatAvailability: Number
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;