import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getNotifications = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const userId = userInfo.id;
  
      // Query to retrieve notifications for the user
      const q = `
            SELECT n.*, 
                   sender.name AS sender_name,
                   recipient.name AS recipient_name,
                   post.desc AS post_desc,
                   comment.desc AS comment_desc
            FROM notification n
            JOIN user_profile sender ON n.senderUser_id = sender.id
            JOIN user_profile recipient ON n.recipientUser_id = recipient.id
            LEFT JOIN user_post post ON n.post_id = post.id
            LEFT JOIN post_comment comment ON n.comment_id = comment.id
            WHERE n.recipientUser_id = ? ORDER BY n.created_datetime DESC`;
      
      db.query(q, [userId], (err, notifications) => {
        if (err) {
          console.error("Error retrieving notifications:", err);
          return res.status(500).json("Error retrieving notifications.");
        }
  
        // If there are no notifications, return an empty array
        if (!notifications || notifications.length === 0) {
          return res.status(200).json([]);
        }
  
        // If there are notifications, return them
        return res.status(200).json(notifications);
      });
    });
  };
  

export const updateNoti = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const notificationId = req.body.notificationId; // Assuming you pass the array of notification IDs in the request body
    if (!notificationId || notificationId.length === 0) {
      return res.status(400).json("Notification IDs array is required and must not be empty.");
    }

    const updateQuery = "UPDATE notification SET isRead = 'yes' WHERE id IN (?) AND recipientUser_id = ?";
    db.query(updateQuery, [notificationId, userInfo.id], (err, result) => {
      if (err) {
        console.error("Error updating notifications:", err);
        return res.status(500).json("Internal server error.");
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json("Notifications not found.");
      }

      return res.status(200).json("Notifications updated successfully.");
    });
  });
};
  