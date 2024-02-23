import DB_Connection from './DB/index.js'
import dotenv from 'dotenv'
import {app} from './app.js'
dotenv.config({
    path: './.env'
})

//DB Connection Method
DB_Connection()
.then(()=>{
    app.listen(process.env.PORT || 2000,()=>console.log(`server is running ${process.env.PORT}`))
})
.catch(()=>console.log("Error Occure while connecting to DB"))