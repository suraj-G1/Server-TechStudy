const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

//A function to send Email that will contain OTP

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification mail from NextGenTech",otp);
        console.log("Email Sent successfully",mailResponse);
    }catch(error){
        console.log("Error occured while sending mail",error);
        throw error;
    }

}

otpSchema.pre('save',async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model('OTP',otpSchema);