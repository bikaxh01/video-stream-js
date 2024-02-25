import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUD - API - KEY,
  api_secret: process.env.CLOUD - API_SECRET,
});

const cloudinaryUpload = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    // upload file from local path
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });

    // File has been uploaded
    console.log(response.url);
    return response;
  } catch (error) {
    // Remove file from local server
    fs.linkSync(localFilepath)
    return null
  }
};

export{cloudinaryUpload}
