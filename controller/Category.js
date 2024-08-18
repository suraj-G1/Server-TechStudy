const Category = require('../models/Category');


//create a tag
exports.createCategory = async(req,res)=>{
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
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);
        
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

exports.showAllCategories = async (req,res)=>{
    try{
        const allCategory = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:'All tags returned successfully'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Error while showing all the Category'
        })

    }
}

//function categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
    try {
            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Data Not Found',
                });
            }
            //get coursesfor different categories
            const differentCategories = await Category.find({
                                         _id: {$ne: categoryId},
                                         })
                                         .populate("courses")
                                         .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategories,
                },
            });

    }
    catch(error ) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}