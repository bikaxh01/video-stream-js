import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.accessToken

    if(!token){
        res.status(403).json({
            message:"Invalid Authentication"
        })
        return
    }

    const verifyJWT= jwt.verify(token,process.env.JWT_TOKEN)
    

    const isExists = await userModel.findById(verifyJWT._id).select("-password -refreshToken")

    if (isExists){
        req.user= isExists
        next()
    }else{
        res.status(403).json({
            message:"Invalid User"
        })
    }
})