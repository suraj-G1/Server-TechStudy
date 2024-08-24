// Import the required modules
const express = require("express")
const router = express.Router()
const {createCategory,showAllCategories} = require('../controller/Category');
const {createCourse, getCourseDetails} = require('../controller/Course');
const {auth,isInstructor,isAdmin,isStudent} = require('../middlewares/auth');
const{createSection} = require('../controller/Section');
const{createSubSection} = require('../controller/SubSection');
// Import the required controllers and middleware functions
const {
  login,
  signup,
  changePassword,
  sendOTP,
} = require("../controller/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controller/ResetPassword")

//const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

router.post("/createCategory",createCategory);
// Export the router for use in the main application

router.get('/showAllCategories',showAllCategories);

//create the course
//router.post('/createCourse',auth,isInstructor,createCourse);
router.post("/createCourse", auth, isInstructor, createCourse);

//create section in the course
router.post('/addSection',auth,isInstructor,createSection);

router.get('/getCourseDetails',auth,isInstructor,getCourseDetails);

//create SubSection
router.post('/addSubSection',auth,isInstructor,createSubSection);
module.exports = router;