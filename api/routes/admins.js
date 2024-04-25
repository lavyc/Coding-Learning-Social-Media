import express from "express";
import { registerAdmin, getAllAdminUsers, deleteAdminUser, getAllUsers, deleteUser, getAllPosts, adminDeletePost, deleteComment, deleteReply } from "../controllers/admin.js";

const router = express.Router()

router.get("/postAdmin", getAllPosts)
router.delete("/deleteAdmin/:id", deleteAdminUser)
router.delete("/deleteUser/:id", deleteUser)
router.post("/register", registerAdmin);
router.get("/getAdmin", getAllAdminUsers);
router.get("/getUsers", getAllUsers);
router.delete("/deleteComment/:id", deleteComment)
router.delete("/deleteReply/:id", deleteReply)
router.delete("/deletePost/:id", adminDeletePost)

export default router