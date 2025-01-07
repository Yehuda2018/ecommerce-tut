const cloudirary = require("cloudinary").v2;

cloudirary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const cloudinaryUploadImg2=async(fileToUpload)=>{
   
    return new Promise(resolve=>{
        cloudirary.uploader.upload(fileToUpload, result=>{
            resolve(
                {
                    url:result.secure_url
                },
                {
                    resource_type:"auto"
                }
            )
        })
    })
}

const cloudinaryUploadImg=async(fileToUpload)=>{
      return await cloudirary.uploader.upload(fileToUpload);
}



const cloudinaryUploadImg3=async(fileToUpload)=>{
       // Upload an image
     const uploadResult = await cloudirary.uploader
     .upload(
         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
             public_id: 'shoes',
         }
     )
     .catch((error) => {
         console.log(error);
     });
  
  console.log(uploadResult,);
}

module.exports = cloudinaryUploadImg;
