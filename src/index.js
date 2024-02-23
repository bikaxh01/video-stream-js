import DB_Connection from './DB/index.js'
import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

//DB Connection Method
DB_Connection()