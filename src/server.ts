//const express = require("express") CommonJS syntaxys
import express from "express" //EMS Ecmascript modules
import cors from "cors"
import "dotenv/config"
import { connectDB } from "./config/db"
import router from "./router"
import { corsConfig } from "./config/cors"

connectDB()

const app = express()

//Cors
app.use(cors(corsConfig))
//Para leer datos de formularios ya que viene inhabilitado
app.use(express.json())

app.use("/", router)


export default app