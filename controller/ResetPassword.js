const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
exports.resetPasswordToken = async (req,res)=>{
    try{
        const {email} = req.body;
        const user =await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not registered'
            })
        }

        //generate token
        const token = crypto.randomUUID();

        //update User by adding token and expiration time
        const updateDetails =await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires:Date.now() + 5*60*1000
        },{new:true})

        //create Url
        const url = `https://localhost:3000/update-password/${token}`

        //send the mail
        await mailSender(email,
                        "Password Reset Link",
                        `Password reset link ${url}`);
        return res.status(200).json({
            success:true,
            message:'Email send successfully , please check email and change password'
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error while resetting password'
        })
    }
}

exports.resetPassword =async (req,res)=>{
    try{
        //extract input details
        const {password,confirmPassword,token} = req.body;

        //validate both passwords are matching or not
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:'Passwords are not matching'
            })
        }

        //extract User from the database using token value
        const userDetails =await User.findOne({token:token});
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token does not match with any of the user'
            })
        }
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:'Token is expired please generate again'
            })
        }

        
        //hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )
        return res.status(200).json({
            success:true,
            message:'Reset Password successful'
        })

        


    }catch(error){

    }
}