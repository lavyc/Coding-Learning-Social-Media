import express from "express";
import { addFriendship, deleteFriendship, getFriendship } from "../controllers/friendship.js";

const router = express.Router()

router.get("/",getFriendship)
router.post("/",addFriendship)
router.delete("/",deleteFriendship)

export default router