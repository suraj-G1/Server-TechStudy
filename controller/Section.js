const Section = require('../models/Section');
const Course = require('../models/Course');

//create section
exports.createSection = async (req,res)=>{
    try{
        //fetch the data 
        const {sectionName,courseId} = req.body;
        console.log('I am here ',sectionName,courseId);


        //validate the data
        if(!sectionName || !courseId){
            return res.json({
                success:false,
                message:'All fileds are mandatory'
            })
        }
        
        console.log('I am creating Section');
        //create the section
        const newSection = await Section.create({sectionName});

        console.log("Now I am updating in the Section in the course");
        // update the course 
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                },
            },
            {new:true})
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection"
                },
            })
            .exec();

            //use populate to section and subsection


            //return a response

            res.status(200).json({
                success:true,
                message:'Section created successfully',
                updatedCourseDetails,
            })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create section please try again later',

        })
    }
}

//update the section 
exports.updateSection = async (req,res)=>{
    try{
        //fetch the data
        const {sectionName,sectionId} = req.body;
        
        //validate the data
        if(!sectionName || !sectionId){
            return res.json({
                success:false,
                message:'All fields are necessaary'
            })
        }

        //find the section and update on the basis of sectionId
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})

        //return successful message 
        return res.status(200).json({
            success:true,
            message:'Section updated successfully',
        })
    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error while updating the Section Name'
        })
    }
}

//delete section
exports.deleteSection = async (req,res)=>{
    try{
        //get ID
        const {sectionId} = req.params;

        //validate the data
        if(!sectionId){
            return res.json({
                success:false,
                message:'Enter the section Id'
            })
        }
        //find using Id and delete
        await Section.findByIdAndDelete(sectionId)
    }catch(error){
        return res.status(500).json({
            success:true,
            message:'Error while deleting the Section Name'
        })

    }
}