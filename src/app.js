import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();

//  Basic Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(express.static("public"))

// Routes
import router from "./routes/user.route.js";

app.use('/api/v1/users',router)

export { app };
