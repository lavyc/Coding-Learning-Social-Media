import express from "express";
import { getNotifications, updateNoti } from "../controllers/notification.js";

const router = express.Router();

router.get("/",getNotifications);
router.put("/noti", updateNoti)

export default router