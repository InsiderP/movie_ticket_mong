const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  screenName: {
    type: String,
    enum: ['A', 'B', 'C'] // Specify the valid screen names from the "Room" schema
  },
  seatNo: {
    type: Number,
    validate: {
      validator: async function(value) {
        const room = await mongoose.model('Room').findOne({ screenName: this.screenName });
        return value <= room.seatAvailability;
      },
      message: 'Seat number exceeds available seats for the selected screenName'
    }
  },
  c_name: String
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
