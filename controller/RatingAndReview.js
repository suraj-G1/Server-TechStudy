const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

//create ratingAndReview

exports.createRating = async (req,res)=>{
    try{
        //fetch user
        const userId = req.user.id;

        //fetch data from request body
        const {courseId,rating,review} = req.body;

        //check whether user is enrolled to this course or not
        const courseDetails = await Course.findOne({
            _id:courseId,
            studentsEnrolled:{$elemMatch:{$eq:userId}},
        })

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course'
            })
        }

        //check whether user has already given rating and reviews
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:'Already given Rating And Review',
            })
        }

        //create rating and review
        const ratingAndReview = await RatingAndReview.create({
            user:userId,
            course:courseId,
            rating,
            review,
        })

        //update in the course
        await Course.findByIdAndUpdate(
            courseId,
            {$push:{ratingAndReviews:ratingAndReview._id}},
            {new:true}
        )

        return res.status(200).json({
            success:true,
            message:'Rating and Review given successfully',
            ratingAndReview
        })



    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while creating Review'
        })
    }
}
//calculate average ratin
exports.getAverageRating = async (req,res)=>{
    try{
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:mongoose.Schema.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            averageRating:0,
            message:'No rating given'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while calculating Rating and Review'
        })
    }
}
//get all rating 
exports.getAllRating = async (req,res)=>{
    try{
        const allReview = await RatingAndReview.find({})
                                                .sort({rating:'desc'})
                                                .populate(
                                                    {
                                                        path:'user',
                                                        select:'firstName lastName email image',
                                                    }

                                        
                                               )
                                               .populate(
                                                {
                                                    path:'course',
                                                    select:'courseName'
                                                }
                                               )
                                               .exec();
        return res.status(200).json({
            success:true,
            message:'All review fetched successfully',
            data:allReview
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:'Error while getting reviews and ratings'
        })
    }
}

