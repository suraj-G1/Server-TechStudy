const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/template/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    //get course id and user id
    const { courseId } = req.body;
    const userId = req.user.id;

    //Validation
    if (!courseId) {
      res.json({
        success: false,
        message: "Please provide valid course ID",
      });
    }

    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.json({
          success: false,
          message: "Could not find the course",
        });
      }
      const uid = mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student already enrolled",
        });
      }
      const price = course.price;
      const currency = "INR";

      const options = {
        price: price * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
          courseId: courseId,
          userId,
        },
      };

      try {
        //initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
          success: true,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          thumbnail: course.thumbnail,
          orderId: paymentResponse.id,
          currency: paymentResponse.currency,
          amount: paymentResponse.amount,
        });
      } catch (error) {
        console.log(error);
        res.json({
          success: false,
          message: "Could not initiate order/payment",
        });
      }
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while initiating the payment",
    });
  }
};

//Verify Signature

exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";

  const signature = req.headers("x-razorpay-signature");

  const shaSum = crypto.createHmac("sha256", webhookSecret);

  shaSum.update(JSON.stringify(req.body));

  const digest = shaSum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.json({
          success: false,
          message: "Course not found",
        });
      }

      console.log(enrolledCourse);

      //find the student and add the course in the enrolled courses

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );
      console.log(enrolledStudent);

      //send the confirmation mail
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulation from Suraj",
        "Congratulations,you are onboarded for new course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Successfully enrolled for new Course",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error while enrolling course",
      });
    }
  }
  else{
    return res.status(400).json({
        success:false,
        message:'Invalid Request'
    })
  }
};
