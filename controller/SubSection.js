const SubSection = require('../models/Subsection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv').config();
//create subsection

exports.createSubSection = async (req,res)=>{
    try{
        //fetch the data form req
        //console.log("I am here to add subsection");
        const{sectionId,title,description} = req.body;

        //extract the file
        const video = req.files.video;

      
        if(!sectionId || !description || !title || !video){
            return res.status(400).json({
                success:false,
                message:' Subsection All fields are required'
            })
        }
        //console.log('I have validated everything');

        /// upload video to cloudinary
        const videoDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        console.log(videoDetails);
        //create a subseciton 
        const subSectionDetails = await SubSection.create({
            title:title,
            //timeDuration:timeDuration,
            timeDuration: videoDetails.duration,
            description:description,
            videoUrl:videoDetails.secure_url,
        })

        //update the section 
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {$push:{
                subSection:subSectionDetails._id,
            }},
            {new:true}
            //log updated section here,after adding populate query

        ).populate('subSection');
        return res.status(200).json({
            success:true,
            data:updatedSection,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while creating SubSection',
        })

    }
}

//update the subsection
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
      const updatedSection = await Section.findById(sectionId).populate("subSection");
      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }

//delete the subsection
exports.deleteSubSection = async (req,res)=>{
    try{
        const {subSectionId,sectionId} = req.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId
                }
            }
        )

        const subSection = await SubSection.findByIdAndDelete({_id:subSectionId})

        if(!subSection){
            return res.status(401).json({
                success:false,
                message:"Sub Section not found"
            })
        }
        const updatedSection = await Section.findById(sectionId).populate('subSection');
        return res.status(200).json({
            success:false,
            data:updatedSection,
            message:"Sub Section deleted Successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error occured while deleting the SubSection',
        })
    }
}