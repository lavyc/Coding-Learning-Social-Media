import express from "express";
import { addPost, deletePost, getPosts, getRecommendedPosts, searchPosts, sharePost, getPostById, getAllPosts } from "../controllers/post.js";

const router = express.Router()

router.get("/allPost", getAllPosts)
router.get("/recommend", getRecommendedPosts)
router.get("/:post_id",getPostById)

router.get("/", getPosts)
router.post("/",addPost)
router.delete("/:id",deletePost)
router.post("/search", searchPosts)
router.get("/share/:post_id", sharePost)


export default router