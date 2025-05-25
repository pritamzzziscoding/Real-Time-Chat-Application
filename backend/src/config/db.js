import mongoose from "mongoose"

export const connectDB = async (MONGO_URI) => {
    try {
        const conn = await mongoose.connect(MONGO_URI)
        console.log(`Database connected ${conn.connection.host}`)
    } catch (error) {
        console.log(error.message)
    }
}