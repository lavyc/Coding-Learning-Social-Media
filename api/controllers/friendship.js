import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getFriendship = (req,res)=>{
    const q = "SELECT followers_userid FROM friendship WHERE followings_userid = ?";

    db.query(q, [req.query.followings_userid], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(friendship=>friendship.followers_userid));
    });
}

export const addFriendship = (req, res) => {
  
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO friendship (`followers_userid`,`followings_userid`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.user_id
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Following");
    });
  });
};

export const deleteFriendship = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM friendship WHERE `followers_userid` = ? AND `followings_userid` = ?";

    db.query(q, [userInfo.id, req.query.user_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollowed");
    });
  });
};
