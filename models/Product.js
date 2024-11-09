const mongoose = require('mongoose');

const productSchema =new mongoose.Schema({
        productName:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        prize:{
            type:Number,
            required:true,
        },
        image:{
            type:String,
            required:true,
        },
        ratingAndReview:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"RatingAndReview"
            }
        ],
        customerPurchased:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        seller:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    })


module.exports = mongoose.model('Product',productSchema);