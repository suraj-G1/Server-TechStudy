const Profile = require('../models/Profile');
const User = require('../models/User');

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
        //validate the id 
        if(!id){
            return res.json({
                success:false,
                message:'Id is not valid'
            })
        }

        const userDetails = await User.findById(id).populate('addtionalDetails').exec();

        return res.status(200).json({
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