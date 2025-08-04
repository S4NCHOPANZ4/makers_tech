const express = require("express");
const ErrorHandler = require("../../utils/errorHandler.js")
const router = express.Router();
const axios = require("axios");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const User = require('../../models/userModel.js');




router.post('/guest-session', (req, res) => {
  if (!req.session.userId) {
    req.session.userId = `guest_${Date.now()}`; 
  }
  res.json({ message: 'Guest Session Created', userId: req.session.userId });
});

router.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json({ userId: req.session.userId, profile: 'Aquí va el perfil del guest' });
});

router.get('/check-session', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, userId: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
});
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('error closing session', err);
      return res.status(500).json({ error: 'error closing session' });
    }

    res.clearCookie('connect.sid'); 
    res.json({ message: 'session closed' });
  });
});


// router.get( 
//     "/get-user",
//     catchAsyncErrors(async (req, res, next) => {
//       try {
//         await newUser.save();
//         console.log('Usuario guardado:', newUser);
//         res.status(201).json({
//             success: true,
//             data: "success",
//           });
//       } catch (error) {
//         return next(new ErrorHandler(error.message, 500, "error on /user/get-user" ));
//       }
//     })
//   );

// //routes -> /user/
// router.post( 
//   "/post-user-information",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       res.status(201).json({
//           success: true,
//           data: "success",
//         });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500, "error on /user/get-user" ));
//     }
//   })
// );




module.exports = router;