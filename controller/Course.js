const Course = require('../models/Course');
const Tag = require('../models/Tag');
const User = require('../models/User');
const uploadImageToCloudinary = require('../utils/imageUploader');

//create course handler function
exports.createCourse = async (req,res)=>{
    try{

        //fetch all the data
        const {courseName,courseDescription,whatWillYouLearn,price,tag} = req.body;

        //fetch the thumbnail
        const thumbnail = req.files.thumbnail;


        //validate all the data
        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:'All fields must be filled',
            })
        }

        //check whether user is instructor or not
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Profile Details",instructorDetails);

        //validate the instructor
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found'
            })
        }

        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'Tag details not found'
            })
        }
        //upload to cloudinary 
        const thumnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumnailImage.secure_url,
        })

        // add this course to user 

        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true}
        )

        //update the schema of the tag
        //remaining
        //recheck once
        await Tag.findByIdAndUpdate(
            {course:newCourse._id},
            {name:courseName},
            {description:courseDescription},
            {new:true}
        )

        //return success status
        return res.status(200).json({
            success:true,
            message:'New course added successfully'
        })



    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:'Error while creating course'
        })
    }
}

//get all courses

exports.getAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,

        }).populate('instructor')
        .exec();

        return res.status(200).json({
            success:true,
            message:'All courses fetched successfully'
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error while fetching courses'
        })
    }
}