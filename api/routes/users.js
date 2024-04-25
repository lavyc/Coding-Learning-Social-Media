import express from "express";
import { getUser, updateUser, getBadge, updatePassword, updateProgramming, getAllUsers, getFriends } from "../controllers/user.js";

const router = express.Router()

router.get("/find/:user_id",getUser)
router.put("/", updateUser); 
router.put("/updatePassword", updatePassword);
router.put("/updateProgramming", updateProgramming);
router.get("/badge/:user_id", getBadge);
router.get("/getUsers", getAllUsers)
router.get("/friend", getFriends)

export default router