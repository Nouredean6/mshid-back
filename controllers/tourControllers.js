const asyncHandler = require('express-async-handler');
const cloudinary = require("cloudinary").v2;
const Tour = require('../models/tourModel');
const {fileSizeFormatter} = require('../utils/fileUplaod');
cloudinary.config({
    cloud_name: 'dbrik0fvi',
    api_key: '299811552711523',
    api_secret: 'cgKQZB-XnoIjVNW7m-YZxnNd0VM'
  });


// Create Tour
// const createTour = asyncHandler(async (req, res) => {
//   const { name, price, description, summary, locations,images } = req.body;

//   //   Validation
//   if (!name || !price || !description || !summary) {
//     res.status(400);
//     throw new Error("Please fill in all fields");
//   }

//   // Handle Image upload
//   let fileData = {};
//   if (req.file) {
//     // Save image to cloudinary
//     let uploadedFile;
//     try {
//       uploadedFile = await cloudinary.uploader.upload(req.file.path, {
//         folder: "Murshid Pfe",
//         resource_type: "image",
//       });
//     } catch (error) {
//       res.status(500);
//       throw new Error("Image could not be uploaded");
//     }

//     fileData = {
//       fileName: req.file.originalname,
//       filePath: uploadedFile.secure_url,
//       fileType: req.file.mimetype,
//       fileSize: fileSizeFormatter(req.file.size, 2),
//     };
//   }
//   console.log(req.body);
//   // Create Tour
//   const tour = await Tour.create({
//     name,
//     price,
//     description,
//     summary,
//     image: fileData,
//     locations,
//     images
//   });

//   res.status(201).json(tour);
// });

// Create Tour
const createTour = asyncHandler(async (req, res) => {
  const { name, price, description, summary, locations,images, image } = req.body;

  //   Validation
  if (!name || !price || !description ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Murshid Pfe",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
 
  // Create Tour
  const tour = await Tour.create({
    name,
    price,
    description,
    summary,
    image: fileData,
    locations,
    images
  });

  res.status(201).json(tour);
});








  // Get all Tours
const getTours = asyncHandler(async (req, res) => {
  const tours = await Tour.find();
  // .sort("-createdAt");
  res.status(200).json(tours);
});

// Get single tour
const getTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  // if tour doesnt exist
  if (!tour) {
    res.status(404);
    throw new Error("Tour not found");
  }
  res.status(200).json(tour);
});

// Delete Tour
const deleteTour = asyncHandler(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  // if tour doesnt exist
  if (!tour) {
    res.status(404);
    throw new Error("Tour not found");
  }

  await tour.deleteOne();
  res.status(200).json({ message: "Tour deleted." });
});

// Update Tour
const updateTour = asyncHandler(async (req, res) => {
  const { name, price, description, summary,locations,images} = req.body;
  const { id } = req.params;

  const tour = await Tour.findById(id);

  // if tour doesnt exist
  if (!tour) {
    res.status(404);
    throw new Error("Tour not found");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Murshid Pfe",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Tour
  const updatedTour = await Tour.findByIdAndUpdate(
    { _id: id },
    {
      name,
      price,
      description,
      summary,
      locations,
      image: Object.keys(fileData).length === 0 ? tour?.image : fileData,
      images
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedTour);
});

  
  module.exports = {
    createTour,
    getTours,
    getTour,
    deleteTour,
    updateTour,
  };