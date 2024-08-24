const Course = require('../models/Course');
const Category= require('../models/Category');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

//create course handler function
exports.createCourse = async (req,res)=>{
    console.log('I am not coming here');
    
    try{

        const userId = req.user.id;

		// Get all required fields from request body
        

		let {
			courseName,
			courseDescription,
			whatWillYouLearn,
			price,
			category,
            status,
            instructions
		} = req.body;

        console.log("Category",category);
		// Get thumbnail image from request files
		const thumbnail = req.files.thumbnailImage;

		// Check if any of the required fields are missing
		if (
			!courseName ||
			!courseDescription ||
			!whatWillYouLearn ||
			!price ||
			!thumbnail ||
			!category
		) {
			return res.status(400).json({
				success: false,
				message: "All Fields are Mandatory",
			});
		}
		if (!status || status === undefined) {
			status = "Draft";
		}
		// Check if the user is an instructor
		const instructorDetails = await User.findById(userId, {
			accountType: "Instructor",
		});

		if (!instructorDetails) {
			return res.status(404).json({
				success: false,
				message: "Instructor Details Not Found",
			});
		}

		// Check if the tag given is valid
		const categoryDetails = await Category.findById(category);
		if (!categoryDetails) {
			return res.status(404).json({
				success: false,
				message: "Category Details Not Found",
			});
		}
		// Upload the Thumbnail to Cloudinary
		const thumbnailImage = await uploadImageToCloudinary(
			thumbnail,
			process.env.FOLDER_NAME
		);
		console.log(thumbnailImage);
		// Create a new course with the given details
		const newCourse = await Course.create({
			courseName,
			courseDescription,
			instructor: instructorDetails._id,
			whatWillYouLearn: whatWillYouLearn,
			price,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
		});

		// Add the new course to the User Schema of the Instructor
		await User.findByIdAndUpdate(
			{
				_id: instructorDetails._id,
			},
			{
				$push: {
					courses: newCourse._id,
				},
			},
			{ new: true }
		);
		// Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);
		// Return the new course and a success message
		res.status(200).json({
			success: true,
			data: newCourse,
			message: "Course Created Successfully",
		});
        

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
            allCourses,
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

//get course details
exports.getCourseDetails = async (req,res)=>{
    try{

        //get course id 
        const {courseId} = req.body;

        //find course details
        const courseDetails = await Course.findById(
                                                    {_id:courseId})
                                                    .populate(
                                                        {
                                                            path:'instructor',
                                                            populate:{
                                                                path:'additionalDetails',
                                                            },
                                                        }
                                                    )
                                                    .populate('category')
                                                    //.populate('ratingAndReview')
                                                    .populate({
                                                        path:'courseContent',
                                                        populate:{
                                                            path:'subSection',
                                                        },
                                                    })
                                                    .exec()
        
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find course with the ${courseId}`
            })
        }

        return res.status(200).json({
            success:true,
            message:'Course details fetched successfully',
            data:courseDetails,
        })
        

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while getting all courses'
        })
    }
}