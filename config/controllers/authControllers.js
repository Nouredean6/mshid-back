const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');


// Generate Token
const generateToken = (_id, firstName, lastName, email, isAdmin) => {
    return jwt.sign({ _id, firstName, lastName, email, isAdmin}, process.env.JWT_SECRET, { expiresIn: "1d" });
  };

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;
  
    // Validation
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be up to 6 characters");
    }
  
    // Check if user email already exists
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      res.status(400).json({message: 'Email has already been registered'});
      throw new Error("Email has already been registered");
    } 

      // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm
    });
    
    //   Generate Token
    const token = generateToken(user._id,
      user.firstName,
      user.lastName,
      user.email,
      user.isAdmin);
  
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
  
    if (user) {
      const { _id, firstName, lastName, email} = user;
      res.status(201).json({
        _id,
        firstName,
        lastName,
        email,
        token,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  });
// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    // Validate Request
    if (!email || !password) {
      res.status(400);
      throw new Error("Please add email and password");
    }
  
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
		res.status(401);
		throw new Error("Incorrect email or password");
	}
  
    //   Generate Token
    const token = generateToken(user._id,
      user.firstName,
      user.lastName,
      user.email,
      user.isAdmin);
    
      if(await user.comparePassword(password)){
        // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
      });
      }
    if(user || (await user.comparePassword(password))){
        const { _id, firstName, lastName, email} = user;
      res.status(200).json({
        _id,
        firstName,
        lastName,
        email,
        token,
        isAdmin: user.isAdmin
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
  });
  
// Logout User
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
  });

  // Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, firstName, lastName, email, photo } = user;
    res.status(200).json({
      _id,
      firstName,
      lastName,
      email,
      photo
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});
  // Get all Users
  const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    // .sort("-createdAt");
    res.status(200).json(users);
  });

// Get Login Status
// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// const getUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     const { _id, firstName, lastName, email, photo} = user;
//     res.status(200).json({
//       _id,
//       firstName,
//       lastName,
//       email,
//       photo,
//     });
//   } else {
//     res.status(400);
//     throw new Error("User Not Found");
//   }
// });

//Delete User


//Show Admin
const showAdmin = (req,res)=>{
  res.send('U ACCESSED SOME SENSITIVE ADMIN DATA');
};
// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { firstName,lastName,email} = user;
    user.firstName = req.body.firstName || firstName;
    user.email = req.body.email || email;
    user.lastName = req.body.lastName || lastName;
  //   user.phone = req.body.phone || phone;
  //   user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      photo: updatedUser.photo,
      // phone: updatedUser.phone,
      // bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
   
module.exports = {
    registerUser,
    loginUser,
    loginStatus,
    logout,
    getUser,
    // getUsers,
    // deleteUser,
    showAdmin,
    updateUser
};