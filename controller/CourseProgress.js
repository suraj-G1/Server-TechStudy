
const mongoose = require('mongoose');
const SubSection = require('../models/Subsection')
const CourseProgress = require('../models/CourseProgress');
exports.updateCourseProgess=async(req,res)=>{
    const{courseId,subSectionId} = req.body;
    const userId = req.user.id;
    //console.log("I am here to update the course mark as completed");
    try{
        const subSection = await SubSection.findById(subSectionId);
        console.log("subsection",subSection);
        if(!subSection){
            return res.status(404).json({
                error:'Sub section id is not valid'
            })
        }

        //console.log("Course Id",courseId);
        //console.log("User Id",userId);
        let courseProgress = await CourseProgress.findOne({
            courseID:courseId,
            userId:userId
        })

        if(!courseProgress){
            return res.status(404).json({
                success:false,
                message:'Course Progress does not exist'
            })
        }else{
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    success:false,
                    message:"SubSection already completed"
                })
            }

            courseProgress.completedVideos.push(subSectionId);
        }

        await courseProgress.save();
    }catch(error){
        //console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}