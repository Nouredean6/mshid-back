const mongoose = require('mongoose');
const validator = require('validator');

const tourSchema = mongoose.Schema({
    
        name: {
          type: String,
          required: [true, 'A tour must have a name'],
          // unique: true,
          trim: true,
          // maxlength: [40, 'A tour name must have less or equal then 40 characters'],
          // minlength: [10, 'A tour name must have more or equal then 10 characters'],
          // validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        // duration: {
        //     type: Number,
        //     required: [true, 'A tour must have a duration']
        //   },
        // maxGroupSize: {
        //     type: Number,
        //     required: [true, 'A tour must have a group size']
        //   },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
          },
        image: {
          type: Object,
          default: {},    
          },
        images:[{
                src: String,
                width: Number,
                height: Number
            }],   
        summary: {
            type: String,
            trim: true,
          },
        description: {
            type: String,
            trim: true
          },
        startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
        locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],


});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;