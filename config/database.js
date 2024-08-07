const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = ()=>{
    mongoose.connect(process.env.MONGODB_URL,
        {unifiedTopology:true,useNewUrlParser:true})
        .then(()=>console.log('Connected to Database'))
        .catch((error)=>{
            console.log('Error while connectiong with Database');
            console.error(error);
            process.exit(1);
        })
}