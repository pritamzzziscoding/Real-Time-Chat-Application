import { create } from "zustand";
import { axiosInstance } from "../services/services";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api"

export const useAuthStore = create((set, get)=>({
    authUser : null,
    isSiginingUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    isCheckingAuth : true,
    onlineUsers : [],
    socket : null,

    checkAuth : async () => {
        set({isCheckingAuth : true})
        try {   
            const res = await axiosInstance.get("auth/check")
            set({authUser : res.data})
            get().connectSocket()
        } catch (error) {
            set({authUser : null})
        } finally {
            set({isCheckingAuth : false})
        }
    },

    signup : async (data) => {
        set({isSiginingUp : true})
        try {
            const res = await axiosInstance.post("auth/signup", data)
            set({authUser : res.data.message})
            toast.success("Acount Created Successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({isSiginingUp : false})
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("auth/logout")
            set({authUser : null})
            toast.success("Logout Successfully Done")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    login : async (data) => {
        set({isLoggingIn : true})
        try {
            const res = await axiosInstance.post("auth/login", data)
            set({authUser : res.data.message})
            toast.success("Login Successfully Done")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({isLoggingIn : false})
        }
    },

    updateProfile : async (data) => {
        set({isUpdatingProfile : true})
        try {
            const res = await axiosInstance.put("auth/update-profile", data)
            set({authUser : res.data.message})
            toast.success("Profile Image Updated Successfully")
        } catch (error) {
            console.log(error.message)
            toast.error("Payload too large")
        } finally {
            set({isUpdatingProfile : false})
        }
    },

    connectSocket : async () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return
        const socket = io(BASE_URL, {
            query : {
                userId : authUser._id
            }
        })
        socket.connect()
        set({socket : socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers : userIds})
        })
    },

    disconnectSocket : async () => {
        if(get().socket?.connected) get().socket.disconnect();
    }
}));