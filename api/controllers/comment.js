import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getComments = (req, res) => {
  const q = `SELECT c.*, u.id AS user_id, name, profilePic FROM post_comment AS c JOIN user_profile AS u ON (u.id = c.user_id)
    WHERE c.post_id = ? ORDER BY c.created_datetime DESC
    `;

  db.query(q, [req.query.post_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const commentDesc = req.body.desc;
    if (!commentDesc|| commentDesc.trim() === "") {
      return res.status(400).json("Comment description cannot be empty.");
    }

    const q = "INSERT INTO post_comment(`desc`, `created_datetime`, `user_id`, `post_id`) VALUES (?)";
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.post_id
    ];

    db.query(q, [values], (err, data) => {
      if (err){ 
        return res.status(500).json(err);
      }

      const notificationQ = "INSERT INTO notification (`recipientUser_id`, `senderUser_id`, `post_id`, `created_datetime`,`type`, `isRead`) VALUES (?, ?, ?, ?, ?, ?)";
      const notificationValues = [
        req.body.recipientId, 
        userInfo.id, 
        req.body.post_id, 
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        2,
        "no"
      ];

      db.query(notificationQ, notificationValues, (err, notificationData) => {
        if (err) console.error("Error adding notification:", err);
      });

      return res.status(200).json("Comment has been created.");
    });
  });
};


export const getReplies = (req, res) => {
  const q = `SELECT r.*, u.id AS user_id, name, profilePic FROM reply AS r JOIN user_profile AS u ON (u.id = r.user_id)
    WHERE r.comment_id = ? ORDER BY r.created_datetime DESC
    `;

  db.query(q, [req.query.comment_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

//reply to a comment
export const replyComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const replyDesc = req.body.desc;
    if (!replyDesc|| replyDesc.trim() === "") {
      return res.status(400).json("Comment description cannot be empty.");
    }

    const q = "INSERT INTO reply(`desc`, `created_datetime`, `user_id`, `comment_id`) VALUES (?)";
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.comment_id
    ];

    db.query(q, [values], (err, data) => {
      if (err){ 
        return res.status(500).json(err);
      }

      const getPostIdQuery = "SELECT post_id, user_id FROM post_comment WHERE id = ?";
      db.query(getPostIdQuery, req.body.comment_id, (err, result) => {
        if (err) return res.status(500).json(err);
        
        const postId = result[0].post_id;
        const userId = result[0].user_id;

        const notificationQ = "INSERT INTO notification (`recipientUser_id`, `senderUser_id`, `post_id`, `comment_id`, `created_datetime`,`type`, `isRead`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const notificationValues = [
          userId,
          userInfo.id, 
          postId,
          req.body.comment_id, 
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
          4,
          "no"
        ];

        db.query(notificationQ, notificationValues, (err, notificationData) => {
          if (err) console.error("Error adding notification:", err);
        });

        return res.status(200).json("Reply has been created.");
      });
    });
  });
};

export const getCommentLikes = (req,res)=>{
  const q = "SELECT user_id FROM comment_like WHERE comment_id = ?";

  db.query(q, [req.query.comment_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(comment_like=>comment_like.user_id));
  });
}

export const addCommentLike = (req, res) => {
  
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO comment_like (`user_id`,`comment_id`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.comment_id
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);

      const getPostIdQuery = "SELECT post_id, user_id FROM post_comment WHERE id = ?";
      db.query(getPostIdQuery, req.body.comment_id, (err, result) => {
        if (err) return res.status(500).json(err);
        
        const postId = result[0].post_id;
        const userId = result[0].user_id;
        const notificationQ = "INSERT INTO notification (`recipientUser_id`, `senderUser_id`, `post_id`,`comment_id`, `created_datetime`,`type`, `isRead`) VALUES (?,?, ?, ?, ?, ?, ?)";
        const notificationValues = [
          userId,
          userInfo.id, 
          postId,
          req.body.comment_id, 
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
          3,
          "no"
        ];

        db.query(notificationQ, notificationValues, (err, notificationData) => {
          if (err) console.error("Error adding notification:", err);
        });

        return res.status(200).json("Comment has been liked.");
      });
    });
  });
};

export const deleteCommentLike = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM comment_like WHERE `user_id` = ? AND `comment_id` = ?";

    db.query(q, [userInfo.id, req.body.comment_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Comment has been disliked.");
    });
  });
};

// Function to store the total likes in the user_ranking table
export const updateTotalLikes = (req, res) => {
  // Query to calculate total likes for each user
  const q = `
    UPDATE user_ranking AS ur
    JOIN (
      SELECT pc.user_id, COUNT(cl.user_id) AS totalLikes
      FROM post_comment AS pc
      LEFT JOIN comment_like AS cl ON pc.id = cl.comment_id
      GROUP BY pc.user_id
    ) AS likes ON ur.user_id = likes.user_id
    SET ur.totalLikes = likes.totalLikes
  `;

  // Execute the query
  db.query(q, (err, results) => {
    if (err) {
      console.error("Error updating totalLikes:", err);
      return res.status(500).json("Error updating totalLikes");
    }

    //console.log("TotalLikes updated successfully.");
    return res.status(200).json("TotalLikes updated successfully.");
  });
};

export const userIdsByRank = (req, res) => {
    // Query to select user IDs based on their total likes
    const q = `
    SELECT ur.user_id, up.username, up.profilePic, ur.totalLikes
    FROM user_ranking AS ur
    JOIN user_profile AS up ON ur.user_id = up.id
    ORDER BY ur.totalLikes DESC
  `;

  // Execute the query
  db.query(q, (err, results) => {
    if (err) {
      console.error("Error retrieving user IDs by total likes:", err);
      return res.status(500).json("Error retrieving user IDs by total likes");
    }

    // Extract user IDs from the results
    const userData = results.map((row) => ({
      user_id: row.user_id,
      username: row.username,
      profilePic: row.profilePic ? row.profilePic: null,
      totalLikes: row.totalLikes
    }));

    return res.status(200).json(userData);
  });
};


export const getNumComments = (req,res)=>{
  const q = "SELECT user_id FROM post_comment WHERE post_id = ?";

  db.query(q, [req.query.post_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(post_comment=>post_comment.user_id));
  });
}
