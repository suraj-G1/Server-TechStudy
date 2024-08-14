const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

//create subsection

exports.createSubSection = async (req,res)=>{
    try{
        //fetch the data form req
        const{sectionId,title,timeDuration,description} = req.body;

        //extract the file
        const video = req.files.videoFile;

        //validate
        if(!sectionId || !description || !title || !timeDuration || !video){
            return res.json({
                success:false,
                message:'All fields are required'
            })
        }

        /// upload video to cloudinary
        const videoDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create a subseciton 
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
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

        )

        return res.status(200).json({
            success:true,
            message:'Subsection created successfully',
            updatedSection,
        })

    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error while creating SubSection',
        })

    }
}

//update the subsection
exports.updateSubSection = async (req,res)=>{
    try{
        const {subSectionTitle,subSectionId} = req.body;
        
        //validate the input
        if(!subSectionTitle || !subSectionId){
            return res.json({
                success:false,
                message:'All fields are necessary'
            })
        }
        const subSection = await SubSection.findByIdAndUpdate(subSectionId,{subSectionTitle},{new:true});
        return res.status(200).json({
            success:true,
            message:'SubSection Updated successfully',
        })
        
    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error while updating the SubSection'
        })
    }
}

//delete the subsection
exports.deleteSubSection = async (req,res)=>{
    try{
        const {subSectionId} = req.params;
        if(!subSectionId){
            return res.json({
                success:true,
                message:'Provide Subsection Id'
            })
        }
        await SubSection.findByIdAndDelete(subSectionId);
    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error occured while deleting the SubSection',
        })
    }
}