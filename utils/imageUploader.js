const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async(file,folder,height,quality)=>{
    const options = {folder};
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality = quality;
    }
    options.resource_type = 'auto';
    console.log('I am here to upload the image');
    const result = await cloudinary.uploader.upload(file.tempFilePath,options);
    console.log("Uploded successfully");
    return result;

}