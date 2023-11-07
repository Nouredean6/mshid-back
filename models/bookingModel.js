const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  priceTour: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: function () {
      return new Date();
    }
  },
  paid: {
    type: Boolean,
    default: true
  }
});

// bookingSchema.pre(/^find/, function(next) {
//   this.populate('user').populate({
//     path: 'tour',
//     select: 'name'
//   });
//   next();
// });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
