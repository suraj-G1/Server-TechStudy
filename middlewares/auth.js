const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

exports.auth = async (req,res,next)=>{
    try{
        
        const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            }) 
        }
        

        //verify the token
        try{
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            
            req.user = decode;
        }catch(error){
            return res.status(401).json({
                success:false,
                message:'Token is invalid'
            })
        }
        next();
    }catch(error){
        
        return res.status(500).json({
            success:false,
            message:'Something went wrong while validating the token'
        })
    }
}

//isStudent Authentication
exports.isStudent = (req,res,next)=>{
    try{
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success:false,
                message:'This is protected route for Student'
            })
            
        }
        next();
    }catch(error){
        
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified',
        })
    }
}


//isInstructor 
exports.isInstructor = (req,res,next)=>{
    try{

        
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success:false,
                message:'This is protected route for Instructor'
            })

        }
        next();
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified',
        })
    }
}

//isAdmin

exports.isAdmin= (req,res,next)=>{
    try{
        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success:false,
                message:'This is protected route for Admin'
            })
            
        }
        next();
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified',
        })
    }
}

