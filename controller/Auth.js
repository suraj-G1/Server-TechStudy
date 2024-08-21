const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
require('dotenv').config();
const {passwordUpdated} = require('../mail/template/passwordUpdate')
//send OTP function 
exports.sendOTP = async (req,res)=>{
    try{
        //fetch email from request body
        const {email} = req.body;

        //check whether email already exists or not
        const checkUserPresent  = User.findOne({email});

        //if user already exists then return a response
        if(checkUserPresent){
            return res.status(409).json({
                success:false,
                message:'User already exists'
            })
        }  

        // now generate OTP using otp-generator

        var otp = otpGenerator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false
        })
        console.log("Generated OTP is",otp);

        //check whether genearted otp is unique or not
        let result = await OTP.findOne({otp});
        while(result){
            otp = otpGenerator.generate(6,{
                lowerCaseAlphabets:false,
                upperCaseAlphabets:false,
                specialChars:false
            })
            result = await OTP.findOne({otp});
        }

        const otpPayload = {email,otp};

        //create entry of a otpPayload in Database
        const otpBody =await OTP.create(otpPayload);
        console.log(otpBody);

        //return a successful message

        res.status(200).json({
            success:true,
            message:'OTP send successfully',
            otp,
        })
    }catch(error){
        console.log(error);
        res.status(501).json({
            success:false,
            message:error.message,
        })
    }
};
//signup function
exports.signup = async (req,res)=>{
    try{

        //fetch data from the request
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate the information 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are compulsory'
            })
        }

        // check whether password and confirmPassword are same or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and confirmPassword are not same'
            })
        }

        //check user is already exists or not
        const existingUser =await User.findOne({email});
        if(existingUser){
            return res.status(409).json({
                success:false,
                message:"User already exists",
            })
        }

        //find most recent OTP
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);

        //validate the OTP
        if(recentOTP.length === 0){
            return res.status(400).json({
                success:false,
                message:'OTP is not valid'
            })
        }else if(otp !== recentOTP.otp){
            return res.status(400).json({
                success:false,
                message:'Invalid OTP'
            })
        }

        //Hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        //create Profile of the User
        const profileDetails = Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })
        //create entry in Database
        const user = User.create({
            firstName,
            lastName,
            email,
            accountType,
            additionalDetails:profileDetails._id,
            password:hashedPassword,
            accountType,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}&${lastName}`
        })

        return res.success(200).json({
            success:true,
            message:'User registered successfully',
            user,
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered please try again'
        })
    }
};
//login 
exports.login = async (req,res)=>{
    try{
        //fetch input values from request body
        const {email,password} = req.body;

        //validate the inputs
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //check whether the user is registered or not
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User is not registered please signup first'
            })
        }

        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            })
            user.token = token;
            user.password = undefined;
            const options = {
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            })
        }else{
            return res.status(401).json({
                success:false,
                message:'Password not matched'
            })
        }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error while logging in'
        })
    }
}
//change Password 
exports.changePassword = async(req,res)=>{
    try{
        const userId = req.user.id;
        const{oldPassword,newPassword,confirmPassword} = req.body;
        const userDetails = await User.findById(userId);
        const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails.password);
        if(!isPasswordMatch){
            return res.status(404).json({
                success:false,
                message:'Password are not matching'
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(404).json({
                success:false,
                message:'Passwords are not matching'
            })
        }

        //encrypt the password and update in the user details
        const hashedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            {userId},
            {password:hashedPassword},
            {new:true}
        )

        //sending notification mail
        try{
            const emailResponse = await mailSender(userDetails.email,
                                                   passwordUpdated(
                                                    updatedUserDetails.email,
                                                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                                                   )
            )
            console.log(emailResponse.response);
        }catch(error){
            return res.status(500).json({
                success:false,
                message:'Error occured while sending mail',
                error:error.message
            })
        }
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error occured while Changing Password'
        })
    }
};