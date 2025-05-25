//Controllers function from AUTHENTICATIONS
import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js"
import cloudinary from "../config/cloudinary.js"

export const signup = async (req, res) => {
    const {fullname, email, password} = req.body
    try {
        if(!fullname && !email && !password){
            return res.status(400).json({success : false, message : "All fields are required"})
        }

        const user = await User.findOne({email})
        //Checking if an email already exists!!!
        if(user){
            return res.status(400).json({success : false, message : "Email Already Exists"})
        }
        //Password validation of length 6!!!
        if(password.length < 6){
            return res.status(400).json({success : false, message : "Your Password should be minimum 6 character long"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname,
            email,
            password : hashedPassword,
        })

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save()
            return res.status(201).json({success : true, message : newUser})
        }else{
            return res.status(400).json({success : false, message : "Invalid user data"})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success : false, message : "Internal server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success : false, message : "Invalid Credentials"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({success : false, message : "Invalid Credentials"})
        }

        generateToken(user._id, res)

        res.status(200).json({success : true, message : user})

    } catch (error) {
        console.log("Internal Server Error", error.message);
        return res.status(500).json({success : false, message : "Internal Server Error"})
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge : 0});
        res.status(200).json({success : true, message : "Logged Out Successfully"})
    } catch (error) {
        console.error(error.message)
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body
        const userID = req.user._id

        if(!profilePic){
            return res.status(400).json({success : true, message : "Profile Picture is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userID, {profilePic : uploadResponse.secure_url}, {new : true})

        res.status(200).json({success : true, message : updateUser})

    } catch (error) {
        console.log("Yoooo", error.message)
        res.status(500).json({success : false, message : "Internal Server Error"})
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success : false, message : "internal server error"})
    }
}