import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// generating Token
const genrateRefreshAndAcsessToken = async (userId) => {
  const user = await userModel.findById(userId);

  const AccessToken = user.generateJWT();
  const refreshtoken = user.generateRefreshToken();

  user.refreshToken = refreshtoken;
  await user.save({ validateBeforeSave: false });
  return { AccessToken, refreshtoken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

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
  // const coverimgLocalfilepath = req.files?.coverimg[0]?.path;

  let coverimgLocalfilepath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimgLocalfilepath = req.files.coverImage[0].path;
  }
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

  // check user is created or not and returning user Obj
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
    userObj,
  });
});

//loggin cantroller
const logginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //validating input
  if (!email) {
    res.status(406).json({
      message: "invalid email",
    });
    return;
  }

  // finding user in DB
  const checkUser = await userModel.findOne({ email });

  if (!checkUser) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }
  // matching password to hashed PW
  const isPWcorrect = await checkUser.isPasswordCorrect(password);

  if (!isPWcorrect) {
    res.status(402).json({
      message: "Incorrect Password",
    });
  }

  const { AccessToken, refreshtoken } = await genrateRefreshAndAcsessToken(
    checkUser._id
  );

  const loggedInUser = await userModel
    .findById(checkUser._id)
    .select("-password -refreshToken");

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", AccessToken, option)
    .cookie("RefreshToken", refreshtoken, option)
    .json({
      message: loggedInUser,
    });
});

// logout controller

const loggout = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: "",
    },
  });
  const option = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("RefreshToken", option)
    .json({
      message: "loggout Success !!",
    });
});

// refresh token if expired
const refreshToken = asyncHandler(async (req, res) => {
  const inCommingToken = req.cookies.RefreshToken;

  if (!inCommingToken) {
    res.status(403).json({
      message: "Invalid Token",
    });
    return;
  }

  const verifyToken = jwt.verify(inCommingToken, process.env.REFRESH_TOKEN);

  const user = await userModel.findById(verifyToken._id);

  if (!user) {
    return res.status(404).json({
      message: "invalid user",
    });
  }

  if (inCommingToken !== user.refreshToken) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }

  const { AccessToken, refreshtoken } = await genrateRefreshAndAcsessToken(
    user._id
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", AccessToken, option)
    .cookie("RefreshToken", refreshtoken, option)
    .json({
      message: "Token Refreshed",
    });
});

// Update password
const updatePW = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  console.log(req.user);
  const user = await userModel.findById(req.user);

  const isPWcorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPWcorrect) {
    return res.status(402).json({
      message: "Invalid Pasword",
    });
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Password Changed...",
  });
});

// Get User Detail

const getUser = asyncHandler(async (req, res) => {
  const userId = req.user;

  res.json({
    message: userId,
  });
});

// Avtar update
const updateAvtar = asyncHandler(async (req, res) => {
  const avtarLocalPath = req.files.path;

  if (!avtarLocalPath) {
    return res.status(400).json({
      message: "Avatar not found",
    });
  }
  const avtar = await cloudinaryUpload(avtarLocalPath);

  if (!avtar.url) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }

  const userId = req.user._id;

  const user=await userModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar: avtar.url,
      },
    },
    { new: true }
  ).select('-password')

  res.status(200).json({
    message:user
  })
});


// cover img update
const updateCoverImg = asyncHandler(async (req, res) => {
  const CoverImgLocalPath = req.files.path;

  if (!CoverImgLocalPath) {
    return res.status(400).json({
      message: "Image not found",
    });
  }
  const img= await cloudinaryUpload(avtarLocalPath);

  if (!img.url) {
    return res.status(404).json({
      message: "Internal Server Error",
    });
  }

  const userId = req.user._id;

  const user=await userModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        coverImage:img.url,
      },
    },
    { new: true }
  ).select('-password')

  res.status(200).json({
    message:user
  })
});

export {
  registerUser,
  logginUser,
  loggout,
  refreshToken,
  updatePW,
  getUser,
  updateAvtar,
  updateCoverImg
};
