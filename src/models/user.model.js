import mongoose, { Schema } from "mongoose";
import Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      require: true,
      unique: true,
      lowercase: true,
      type: String,
    },
    fullName: {
      type: String,
      require: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
      require: true,
    },
    coverImage: {
      type: String,
    },
    avatar: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "videos",
      },
    ],
  },
  { timestamps: true }
);

// Hashing password before storing to DB
userSchema.pre("save",async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//checking is PW hashed before exporting
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//JWT Genrator
userSchema.methods.generateJWT = function () {
  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.JWT_TOKEN,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

//Generating Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const userModel = mongoose.model("user", userSchema);