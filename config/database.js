const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () =>{
    mongoose.connect(process.env.MONGODB_URL,
        {
            
            useNewUrlParser:true,
        })
        .then(()=>console.log('Connected to Database'))
        .catch((error)=>{
            console.log('Error while connectiong with Database');
            console.error(error);
            process.exit(1);
        })
}