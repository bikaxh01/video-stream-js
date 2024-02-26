import { Router } from "express";
import { registerUser,logginUser,loggout } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avtar", maxCount: 1 },
    { name: "coverimg", maxCount: 1 },
  ]),
  registerUser
);

router.route('/loggin').post(logginUser)

router.route('/loggout').post(verifyJWT,loggout)


export default router;
