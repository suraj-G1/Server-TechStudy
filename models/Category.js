const mongoose = require('mongoose');

exports.categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course',
        }
    ],
})

module.exports = new mongoose.model('Category',categorySchema);