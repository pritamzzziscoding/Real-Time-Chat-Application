import jwt from "jsonwebtoken"

export const generateToken = (userID, res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET,{
        expiresIn : "7d"
    });

    res.cookie("jwt", token, {
        maxAge : 7 * 24 * 60 * 60 * 1000, // 7days in millesecond
        httponly : true, //prevent XSS attack
        sameSite : "strict", //CSRF attacks 
        secure : process.env.NODE_ENV !== "development"
    });

    return token;
}