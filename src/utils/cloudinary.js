import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const cloudinaryUpload = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    // upload file from local path
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
     fs.linkSync(localFilepath)
    
    return response;
  } catch (error) {
    // Remove file from local server
    fs.linkSync(localFilepath)
    return null
  }
};

export{cloudinaryUpload}
