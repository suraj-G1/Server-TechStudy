const Tag = require('../models/Tag');

//create a tag
exports.createTag = async(req,res)=>{
    try{

        //fetch the data
        const {name,description} = req.body;

        //validate the data
        if(!name || !description){
            return res.json({
                success:false,
                message:'All fields are necessary'
            })
        }

        //create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        
        //return a success message
        return res.status(200).json({
            success:true,
            message:'Tag created Successfully'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//get all tags

exports.showAllTags = async (req,res)=>{
    try{
        const allTags = await Tag.find({},{name:true,description:true});

        return res.status(200).json({
            success:true,
            message:'All tags returned successfully'
        })
    }catch(error){

    }
}