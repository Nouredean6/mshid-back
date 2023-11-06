const express = require('express');
const { getCheckoutSession, createBooking, findUsersInBookings , getBookingsForUser , getAllBookings } = require('../controllers/bookingControllers');
// const bookingController = require('./../controllers/bookingController');
// const authController = require('./../controllers/authController');
const { protect, verifyIsAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// router.use(authController.protect);

router.get('/checkout-session/:id',protect, getCheckoutSession);

// router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(getAllBookings)
  .post(createBooking)
  

// router
  // .route('/:id')
  // .get(getBookingById);
//   .patch(updateBooking)
//   .delete(deleteBooking);
router.get('/user/:userId', getBookingsForUser);
router.get('/users/:tourId', findUsersInBookings);

// router.get('/numberbooked', tourBookedByUsers);
module.exports = router;
