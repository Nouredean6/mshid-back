const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const googleAuth = require('./config/passportSetup.js');
const authRoutes = require('./routes/authRoutes.js');
const tourRoutes = require('./routes/tourRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');
const cookieParser = require('cookie-parser');
const chalk = require('chalk');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const path = require("path");
const nodemailer = require('nodemailer');
const axios = require("axios");
const UserModel = require("./models/userModel.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailerSmtpTransport = require('nodemailer-smtp-transport');
const PDFDocument = require('pdfkit');
const fs = require('fs');


//Middleware to read data:
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(mongoSanitize());
//Configuring Cors
app.use(
    cors({
      origin: ["http://localhost:3000",],
      credentials: true,
    })
  );
//Storing Uplaoded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

//Test Route
app.get('/', (req,res)=>{
    res.send('Welcome To HomePage');
});
//Errorhandler middleware
// app.use(errorHandler);
// app.use(notFound);

//Define PORT
const PORT = process.env.PORT || 5000;
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Murshidsupp55@gmail.com',
    pass: 'yijl vvob ieti gvis',
  }
});
//Connecting To DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${chalk.green.bold("✔")} 👍 Server running on port ${chalk.green.bold(PORT)}`);
    });
  })
  .catch((err) => console.log(err));



  app.post('/forgot-password', (req, res) => {
    const {email} = req.body;
    UserModel.findOne({email: email})
    .then(user => {
        if(!user) {
            return res.status(404).json({Status:"User not found"});
        } 
        const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
          
          var mailOptions = {
            from: 'Murshidsupp55@gmail.com',
            to: email,
            subject: 'Reset Password Link',
            text: `http://localhost:3000/reset_password/${user._id}/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return res.status(500).json({Status: "Error sending email"});
            } else {
              return res.status(200).json({Status: "Success"});
            }
          });
    })
})
app.post('/reset-password/:id/:token', (req, res) => {
  const {id, token} = req.params
  const {password} = req.body

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(password, 10)
          .then(hash => {
              UserModel.findByIdAndUpdate({_id: id}, {password: hash})
              .then(u => res.send({Status: "Success"}))
              .catch(err => res.send({Status: err}))
          })
          .catch(err => res.send({Status: err}))
      }
  })
})
app.post('/contact', (req,res) => {
  const { name, email, subject, message } = req.body;
  const to = 'Murshidsupp55@gmail.com';
  var mailOptions = {
    from: email,
    to: to,
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };
  transporter.sendMail(mailOptions,(error,info) => {
    if (error) {
      console.error('Error sending email: ' + error);
      res.status(500).json({ message: 'Failed to send email' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});
app.post('/payment-success', (req, res) => {
  const { email } = req.body;

  UserModel.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(404).json({ Status: 'User not found' });
    }

    // Create a PDF using pdfkit
    const doc = new PDFDocument();
    const pdfFileName = 'ticket.pdf';
    const pdfFilePath = `./${pdfFileName}`;
    doc.pipe(fs.createWriteStream(pdfFilePath));

    // Add content to the PDF
    doc.fontSize(14).text(`${user.firstName} ${user.lastName}`, { align: 'left' });
    doc.text(`Agency Address: Massira 3 A NO 336 Marrakech, 40000`);

    doc.text(`In the Agency, you shall provide your CIN to confirm your tour purchase.`);

    doc.text(`Please arrive at least 15 minutes before the tour starts. Details are in your ticket.`);
    
    doc.text(`Contact us at Murshidsupp55@gmail.com or 05 28 28 41 56.`);

    doc.text(`We can't wait to share the beauty of Morocco with you. Safe travels!`);
    doc.end();

    // Email data
    const mailOptions = {
      from: 'Murshidsupp55@gmail.com',
      to: email,
      subject: 'Your tour is getting ready!',
      html: `
          <html>
          <body>
            <h1>Your Tour is Getting Ready!</h1>
            
            <p>Dear ${user.firstName},</p>
            
            <p>Thank you for purchasing our tour. Your experience with us promises to be truly exceptional. Here are the details:</p>
            
            <p><strong>Agency Address:</strong> Massira 3 A NO 336 Marrakech, 40000 </p>
            
            <p><strong>In the Agency, you shall provide your CIN to confirm your tour purchase, and get a ticket for the Coach Bus</p>
            
            <p>Please arrive at least 15 minutes before the tour starts. You will find all the details in your ticket. Our friendly guide will be there to welcome you.</p>
            
            <p>If you have any questions or need assistance, feel free to contact us at Murshidsupp55@gmail.com or 05 28 28 41 56.</p>
            
            <p>We can't wait to share the beauty of Morocco with you. If you have any further questions, please don't hesitate to get in touch. Safe travels!</p>
            
            <p>Warm regards,</p>
          </body>
          </html>
        `,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfFilePath,
        },
      ],
    };

    // Send the email with the PDF attachment
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ Status: 'Error sending email' });
      } else {
        return res.status(200).json({ Status: 'Success' });
      }
    });
  });
});