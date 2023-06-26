const express = require('express');
const mongoose = require('mongoose');
const Room = require('./models/room');
const Booking = require('./models/booking');
const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://psss98387:1234@cluster0.ixto0iw.mongodb.net/theater?retryWrites=true&w=majority")
.then(()=>console.log("Connect to database and listening"))
.catch((err)=>console.log(err))
const roomDocuments = [
  { screenName: 'A', seatAvailability: 45 },
  { screenName: 'B', seatAvailability: 65 },
  { screenName: 'C', seatAvailability: 70 }
];

// Check if rooms collection is empty before inserting the documents
Room.countDocuments({})
  .then((count) => {
    if (count === 0) {
      const options = { upsert: true };
      return Room.collection.insertMany(roomDocuments, options);
    }
  })
  .then(() => {
    console.log('Documents inserted successfully');
  })
  .catch((error) => {
    console.error('Error checking or inserting documents:', error);
  });


//no. of screen available
  app.get('/rooms', async (req, res) => {
    try {
      const rooms = await Room.find(
        {
          $or: [
            { screenName: 'A', seatAvailability: 45 },
            { screenName: 'B', seatAvailability: 65 },
            { screenName: 'C', seatAvailability: 70 }
          ]
        }
      );
      res.json(rooms);
    } catch (error) {
      console.error('Error retrieving rooms:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  //booking 
  app.post('/booking', async (req, res) => {
    const { screenName, seatNo, c_name } = req.body;
  
    try {
      const room = await Room.findOne({ screenName });
  
      if (!room) {
        // If screenName doesn't match any room, return available screen names
        const availableScreenNames = await Room.find({}, 'screenName');
        res.json({
          message: 'Invalid screenName. Please choose from available screen names.',
          availableScreenNames,
        });
      } else {
        const existingBooking = await Booking.findOne({
          screenName,
          seatNo: { $in: seatNo },
        });
  
        if (existingBooking) {
          res.json({ message: 'The selected seat(s) are already booked. Please choose different seat(s).' });
        } else {
          // Create a new booking instance
          const booking = new Booking({
            screenName,
            seatNo,
            c_name,
          });
  
          // Validate and save the booking
          const validationError = booking.validateSync();
          if (validationError) {
            const errorMessage = validationError.errors['seatNo'].message;
            res.json({ message: errorMessage });
          } else {
            await booking.save();
            res.json({ message: 'Booking successful' });
          }
        }
      }
    } catch (error) {
      console.error('Error processing booking:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
   
  
  //avaialble after booking
  app.get('/available_seat', async (req, res) => {
    try {
      const rooms = await Room.find({});
      const bookings = await Booking.find({});
    
      const availableSeats = rooms.map((room) => {
        const bookedSeats = bookings
          .filter((booking) => booking.screenName === room.screenName)
          .reduce((total, booking) => total.concat(booking.seatNo), []);
  
        const availableSeat = room.seatAvailability - bookedSeats.length;
  
        return {
          name: room.screenName,
          seatCapacity: availableSeat >= 0 ? availableSeat : 0,
        };
      });
    
      res.json(availableSeats);
    } catch (error) {
      console.error('Error retrieving available seats:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

 //cancel api
  app.post('/cancel', async (req, res) => {
    const { screenName, seatNo } = req.body;
  
    try {
      const booking = await Booking.findOneAndDelete({ screenName, seatNo });
  
      if (booking) {
        res.json({ message: 'Booking canceled successfully' });
      } else {
        res.json({ message: 'No booking found for the specified screenName and seatNo' });
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  

const port=3000
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
