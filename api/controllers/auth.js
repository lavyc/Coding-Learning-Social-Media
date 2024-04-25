import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req,res)=>{
    //check user if exixts
    const q = "SELECT * FROM user_profile WHERE username= ?"

    db.query(q,[req.body.username.toLowerCase()], (err,data)=>{
        if(err) return res.status(500).json(err)
        if(data.length) return res.status(409).json("User already exists!")

        // Validate password length
        if (req.body.password.length < 6) {
            return res.status(400).json("Password should have at least 6 characters.");
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email format
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json("Invalid email format. Please enter a valid email address.");
        }

        //create a new user
        //hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt)
        const q = "INSERT INTO user_profile (`email`,`username`,`password`,`name`,`role`) VALUE (?)"

        const values = [
            req.body.email,
            req.body.username.toLowerCase(),  
            hashedPassword, 
            req.body.name,
            "user"
        ];

        db.query(q,[values], (err, data)=>{
            if (err) {
                return res.status(500).json(err);
            } else {
                // Get the user_id of the newly inserted user
                const userId = data.insertId;

                // Insert the user into user_ranking table with the new rank
                const insertRankingQuery = "INSERT INTO user_ranking (`user_id`, `totalLikes`) VALUES (?, ?)";
                const rankingValues = [userId, 0]; // Set initial totalLikes to 0

                db.query(insertRankingQuery, rankingValues, (err) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        return res.status(200).json("User is successfully created.");
                    }
                });
            }
        })
    }
)}

export const login = (req,res)=>{
    const q = "SELECT * FROM user_profile WHERE username = ?"

    db.query(q,[req.body.username],(err,data)=>{
        if(err) return res.status(500).json(err);
        if(data.length ===0) return res.status(404).json("User not found!");

        const checkPassword= bcrypt.compareSync(req.body.password, data[0].password);
        
        if(!checkPassword) 
            return res.status(400).json("Wrong password or username!");

        const tokenPayload = {
            id: data[0].id,
            role: data[0].role
        };

        const token= jwt.sign(tokenPayload,"secretkey");

        const {password, ...others}= data[0]
        res.cookie("accessToken", token,{
            httpOnly: true,
        }).status(200).json({ ...others, role: data[0].role });

    });
};

export const logout = (req,res)=>{
    res.clearCookie("accessToken",{
        secure:true,
        sameSite:"none"
    }).status(200).json("User has been logged out")
};