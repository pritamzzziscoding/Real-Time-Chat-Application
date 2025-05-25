import express, { json } from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.routes.js"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js"
import { app, server } from "./lib/socket.js"
import path from "path"

dotenv.config()
const PORT = process.env.PORT
const __dirname = path.resolve()

const MONGO_URI = process.env.MONGO_URI

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend","dist", "index.html"))
    })
}

server.listen(PORT, async ()=>{
    await connectDB(MONGO_URI)
    console.log(`Server is listing at port ${PORT}`)
})