import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  console.log(username);

  //input Validation
  if (
    [username, fullName, email, password].some((item) => item?.trim() === "")
  ) {
    res.status(400).json({
      message: "Invalid input",
    });
    return;
  }

  // Does user already exists
  const isExisted = await userModel.findOne({
    $or: [{ username }, { email }],
  });

 
  // exists then return
  if (isExisted) {
    res.status(402).json({
      message: "User Aleady Exists",
    });
    return;
  }

  const avtarLocalfilepath = req.files?.avtar[0]?.path;
  const coverimgLocalfilepath = req.files?.coverimg[0]?.path;

  if (!avtarLocalfilepath) {
    return res.status(404).json({
      message: "invalid avtar",
    });
  }

  // upload file to cloud
  const avtar = await cloudinaryUpload(avtarLocalfilepath);
  const converImg = await cloudinaryUpload(coverimgLocalfilepath);

  // check is file uploaded ...?
  if (!avtar) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  // Save data to DB

  const user = await userModel.create({
    fullName,
    email,
    username: username.toLowerCase(),
    avatar: avtar.url,
    coverImage: converImg?.url || "",
    password,
  });

  // check user is created or not
  const userObj = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  if (!userObj) {
    res.status(500).json({
      message: "Internal server error while creating user",
    });
    return;
  }

  res.status(200).json({
    userObj
  })
});
