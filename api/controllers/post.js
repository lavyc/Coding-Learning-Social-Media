import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {

  //const q =`SELECT p.*, u.id AS user_id, name, profilePic FROM user_post AS p JOIN user_profile AS u ON (u.id=p.user_id)`
  const userId = req.query.user_id;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    let q;
    let values;
    if (userId) {
      //user profile posts
      q = `SELECT p.*, u.id AS user_id, name, profilePic 
      FROM user_post AS p JOIN user_profile 
      AS u ON (u.id = p.user_id) WHERE 
      p.user_id = ? ORDER BY p.created_datetime DESC`;
      values = [userId];
    } else {
      //home page posts
      q = `SELECT DISTINCT p.*, u.id AS user_id, name, profilePic 
      FROM user_post AS p JOIN user_profile AS u ON 
      (u.id = p.user_id) LEFT JOIN friendship AS f ON 
      (p.user_id = f.followings_userid) WHERE f.followers_userid= ? 
      OR p.user_id = ? ORDER BY p.created_datetime DESC`;

      values = [userInfo.id, userInfo.id];
    }

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);//error
      return res.status(200).json(data);//no error
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Check if the description is empty
    if (!req.body.desc || req.body.desc.trim() === "") {
      return res.status(400).json("Description is required.");
    }

    const q =
      "INSERT INTO user_post(`desc`, `media`, `created_datetime`, `user_id`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.media,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM user_post WHERE `id`=? AND `user_id` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};

export const getRecommendedPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    //Retrieve user's programming languages and skillset
    const getUserProgrammingQuery = `SELECT * FROM user_programming WHERE user_id = ?`;
    db.query(getUserProgrammingQuery, [userInfo.id], (err, programmingData) => {
      if (err) return res.status(500).json(err);

      const languages = programmingData.map((row) => row.language);
      const skillsets = programmingData.map((row) => row.skillset);

      //Extract keywords from post descriptions
      const keywords = [...languages, ...skillsets];

      //Get recommended posts based on keywords
      const getRecommendedPostsQuery = `
        SELECT DISTINCT p.*, u.id AS user_id, name, profilePic
        FROM user_post AS p
        JOIN user_profile AS u ON (u.id = p.user_id)
        WHERE ${keywords.map((kw) => `p.desc LIKE '%${kw}%'`).join(" OR ")}
        ORDER BY p.created_datetime DESC
      `;
      
      db.query(getRecommendedPostsQuery, (err, recommendedPosts) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(recommendedPosts);
      });
    });
  });
};

export const searchPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const keywords = req.body.keywords;

    // Check if keywords are provided
    if (!keywords || keywords.trim() === "") {
      return res.status(400).json("Keywords are required for search.");
    }

    // Construct the search query
    const searchQuery = `SELECT p.*, u.id AS user_id, name, profilePic
      FROM user_post AS p
      JOIN user_profile AS u ON (u.id = p.user_id)
      WHERE ${keywords.split(" ").map((kw) => `p.desc LIKE '%${kw}%'`).join(" OR ")}
      ORDER BY p.created_datetime DESC`;

    db.query(searchQuery, (err, searchResults) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(searchResults);
    });
  });
};

export const sharePost = (req, res) => {
  const post_id = req.params.post_id;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    
    const q = `SELECT * FROM user_post WHERE id = ?`;
    db.query(q, [post_id], (err, postData) => {
      if (err) return res.status(500).json(err);
      if (!postData || postData.length === 0) return res.status(404).json("Post not found.");

      const post = postData[0];

      // Construct the shareable URL
      const postUrl = `http://localhost:5173/posts/${post_id}`;

      // Construct the data to share
      const shareData = {
        id: post.id,
        desc: post.desc,
        media: post.media,
        url: postUrl
      };

      // Return the shareable data
      return res.status(200).json(shareData);
    });
  })
};

export const getPostById = (req, res) => {
  const post_id = req.params.post_id;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `SELECT p.*, u.id AS user_id, name, profilePic 
    FROM user_post AS p JOIN user_profile 
    AS u ON (u.id = p.user_id) WHERE p.id = ?`;

    db.query(q, [post_id], (err, postData) => {
      if (err) return res.status(500).json(err);
      if (!postData || postData.length === 0) return res.status(404).json("Post not found.");

      const post = postData[0];
      return res.status(200).json(post);
    });
  });
};

export const getAllPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      // Query the database to retrieve all posts ordered by the latest
      const query = `SELECT p.*, u.id AS user_id, u.name, u.profilePic
      FROM user_post AS p
      JOIN user_profile AS u ON u.id = p.user_id
      WHERE p.user_id != ?
      ORDER BY p.created_datetime DESC`;

      db.query(query, [userInfo.id], (err, posts) => {
          if (err) return res.status(500).json(err);
  
          // Return the retrieved posts in the response
          return res.status(200).json(posts);
      });
  });
};