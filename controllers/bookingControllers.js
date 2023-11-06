const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const asyncHandler = require('express-async-handler');


getCheckoutSession = async (req, res, next) =>  {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.id);


  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: 'http://localhost:3000/payment-successful',
    cancel_url: 'http://localhost:3000/tours',
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    mode:'payment',
    line_items: [
      {
        price_data: {
          
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
          }
        },
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
};


const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

// exports.webhookCheckout = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed')
//     createBookingCheckout(event.data.object);

//   res.status(200).json({ received: true });
// };


// Create a new booking
const createBooking = asyncHandler(async (req, res, next) => {
  
    const { tourId, userId, priceTour } = req.body;

    // Check if tour and user fields are provided
    if (!tourId || !userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Tour and user fields are required.',
      });
    }

    // Create the booking
    const booking = await Booking.create({ tourId, userId, priceTour });

    res.status(201).json({
      status: 'success',
      data: {
        booking,
      },
    });
   
    
  
});





// Get a booking by ID and populate data about the tour and user
// const getBookingById = asyncHandler(async (req, res, next) => {
  
//     const bookingId = req.params.id; // Assuming the booking ID is passed as a URL parameter

//     // Query the Booking model, populate the 'tour' and 'user' fields
//     const booking = await Booking.findById(bookingId)
//       .populate({
//         path: 'tour',
//         select: 'name', // Select only specific fields from the 'Tour' document
//       })
//       .populate('user');

//     if (!booking) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Booking not found',
//       });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         booking,
//       },
//     });
   
//     res.status(500).json({
//       status: 'error',
//     });
  
// });





// Get all bookings
const getAllBookings = asyncHandler(async (req, res, next) => {
  
    // Query the Booking model to find all bookings.
    const bookings = await Booking.find()
    .populate({
      path: 'userId', // Populate the 'user' field
      select: 'firstName', // Select specific user fields
    })
    .populate({
      path: 'tourId', // Populate the 'tour' field
      select: 'name', // Select specific tour fields
    })

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
      },
    });
  
    // res.status(500).json({
    //   status: 'error',
    // });
  
});

// Get bookings for a specific user and populate data about the user and tour

// Get bookings for a specific user
const getBookingsForUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId; // Assuming the user's ID is passed as a URL parameter

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required.',
      });
    }

    // Query the Booking model to find all bookings associated with the specific user
    const bookings = await Booking.find({ userId: userId}).populate('tourId');

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        status: 'success',
        data: {
          bookings: [],
        },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
      },
    });

});
const findUsersInBookings = async (req, res) => {
  try {
    const tourId = req.params.tourId; // Assuming the user ID is passed as a route parameter
    const bookings = await Booking.find({ tourId: tourId }).populate('userId'); // Populate the user reference

    res.status(200).json({
      status: 'success',
      data: {
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error finding users in bookings',
    });
  }
};




module.exports = {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    // getBookingById,
    getBookingsForUser,
    getAllBookings,
    findUsersInBookings
};
