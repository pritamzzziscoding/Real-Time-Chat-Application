import cloudinary from "../config/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUser = await User.find({_id : {$ne : loggedInUserId}}).select("-password")
        res.status(200).json({success : true , message : filteredUser})
    } catch (error) {
        console.log(error.message)
        res.status.json({success : false , message : "internal server error"})
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params
        const myId = req.user._id

        const message = await Message.find({
            $or : [
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        })

        res.status(200).json({success : true, message})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success : false, message : "Internal Server Error"})
    }
}


export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body
        const {id: receiverId} = req.params
        const senderId = req.user._id

        let img;
        if(image){
            const uploadImage = await cloudinary.uploader.upload(image)
            img = uploadImage.secure_url
        }

        const newMessage = new Message({
            receiverId,
            senderId,
            text,
            image : img
        })

        await newMessage.save()

        //real time functionality
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(200).json({success : true, message : newMessage})

    } catch (error) {
        console.log(error.message)
        res.status(500).json({success : false, message : "Internal Server Error"})
    }
}