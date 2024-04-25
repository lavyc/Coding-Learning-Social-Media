import express from "express";
import { addComment, getComments, getCommentLikes, addCommentLike, deleteCommentLike, updateTotalLikes, userIdsByRank, getNumComments, replyComment, getReplies } from "../controllers/comment.js";

const router = express.Router();

router.get("/",getComments);
router.post("/", addComment);
router.post("/reply", replyComment)
router.get("/reply", getReplies)
router.get("/like",getCommentLikes)
router.post("/like",addCommentLike)
router.delete("/like",deleteCommentLike)
router.put("/like", updateTotalLikes)
router.get("/rank", userIdsByRank)
router.get("/num", getNumComments)

export default router