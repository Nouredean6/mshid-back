const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');


const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    // if user doesnt exist
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
  
    await user.deleteOne();
    res.status(200).json({ message: "User deleted." });
  });
  const updateUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, isAdmin } = req.body;
    const { id } = req.params;
    const user = await User.findById(id);
      // if user doesnt exist
  if (!user) {
    res.status(404);
    throw new Error("user not found");
  }
    // Update User
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      {
        firstName,
        lastName,
        email,
        isAdmin,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(updatedUser);

  
    // if (user) {
    //   const { firstName,lastName,email} = user;
    //   user.firstName = req.body.firstName || firstName;
    //   user.email = req.body.email || email;
    //   user.lastName = req.body.lastName || lastName;
    //   user.phone = req.body.phone || phone;
    //   user.bio = req.body.bio || bio;
    //   user.photo = req.body.photo || photo;
  
      // const updatedUser = await user.save();
      // res.status(200).json({
      //   _id: updatedUser._id,
      //   firstName: updatedUser.firstName,
      //   lastName: updatedUser.lastName,
      //   email: updatedUser.email,
        // photo: updatedUser.photo,
        // phone: updatedUser.phone,
        // bio: updatedUser.bio,
    //   });
    // } else {
    //   res.status(404);
    //   throw new Error("User not found");
    // }
  });
     
// Get all Users
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    // .sort("-createdAt");
    res.status(200).json(users);
  });

  // Get User Data
  const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
  
    if (user) {
      const { _id, firstName, lastName, email, isAdmin } = user;
      res.status(200).json({
        _id,
        firstName,
        lastName,
        email,
        isAdmin
      });
    } else {
      res.status(400);
      throw new Error("User Not Found");
    }
  });

  module.exports = {
    getUser,
    getUsers,
    deleteUser,
    updateUser
  };