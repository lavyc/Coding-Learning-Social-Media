import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getLikes = (req,res)=>{
    const q = "SELECT user_id FROM post_like WHERE post_id = ?";

    db.query(q, [req.query.post_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(post_like=>post_like.user_id));
    });
}

export const addLike = (req, res) => {
  
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO post_like (`user_id`,`post_id`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.post_id
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      const notificationQ = "INSERT INTO notification (`recipientUser_id`, `senderUser_id`, `post_id`, `created_datetime`,`type`, `isRead`) VALUES (?, ?, ?, ?, ?, ?)";
      const notificationValues = [
        req.body.recipientId, 
        userInfo.id, 
        req.body.post_id, 
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        1,
        "no"
      ];
      db.query(notificationQ, notificationValues, (err, notificationData) => {
        if (err) console.error("Error adding notification:", err);
      });

      return res.status(200).json("Post has been liked.");
    });
  });
};

export const deleteLike = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM post_like WHERE `user_id` = ? AND `post_id` = ?";

    db.query(q, [userInfo.id, req.query.post_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been disliked.");
    });
  });
};

