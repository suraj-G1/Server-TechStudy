const Course = require('../models/Course');
const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
exports.updateProfile = async (req,res)=>{
    try{
        const {dateOfBirth="",gender,about="",contactNumber} = req.body;
        const id = req.user.id;

        if(!gender || !contactNumber || !id){
            return res.json({
                success:true,
                message:'Please enter neccessary fields'
            })
        }
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update the profile
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        profileDetails.dataOfBirth = dateOfBirth;
        profileDetails.about = about;
        
        //save the Profile
        profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            profileDetails,
        })

    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error occured while updating the profile',
        })
    }
}

//delete account 

exports.deleteAccount = async (req,res)=>{
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }

        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);
        //unenroll user from all enrolled courses
        await User.findByIdAndDelete(id);
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while deleting Account'
        })
    }
}

//get all user details
exports.getAllUserDetails = async(req,res)=>{
    try{
        //fetch id 
        const id = req.user.id;
       

        const userDetails = await User.findById(id)
        .populate('additionalDetails')
        .exec();

        //console.log(userDetails);
        return res.status(200).json({
  
            userDetails,
            success:true,
            message:'All user extracted successfully',
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while getting all users'
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      //console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.instructorDashboard = async(req,res)=>{
  try{

    const courseDetails = await Course.findById({instructor:req.user.id});

    const courseData = courseDetails.map((course)=>{
      const totalStudentsEnrolled = course.studentsEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;
      const courseDataWithStats = {
        _id:course._id,
        courseName:course.courseName,
        courseDescription:course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
      return courseDataWithStats
    })

    res.status(200).json({
      courses:courseData
    })
    

    
  }catch(error){
    console.log(error);
    return res.status(500).json({
      success:false,
      message:"Internal Server Error"
    })
  }
};