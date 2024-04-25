import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAdmin = (req, res) => {
    // Check if the user already exists
    const checkUserQuery = "SELECT * FROM user_profile WHERE username = ?";
    db.query(checkUserQuery, [req.body.username.toLowerCase()], (err, data) => {
        
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length) {
            return res.status(409).json("User already exists!");
        }

        // Validate password length
        if (req.body.password.length < 6) {
            return res.status(400).json("Password should have at least 6 characters.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email format
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json("Invalid email format. Please enter a valid email address.");
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        // Create a new admin user
        const insertUserQuery = "INSERT INTO user_profile (`email`, `username`, `password`, `name`, `role`) VALUES (?, ?, ?, ?, ?)";
        const values = [
            req.body.email,
            req.body.username.toLowerCase(),
            hashedPassword,
            req.body.name,
            "admin" // Assigning 'admin' role to the new user
        ];

        db.query(insertUserQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json("Admin user is successfully created.");
        });
    });
};


export const getAllAdminUsers = (req, res) => {
    // Check if the user is authenticated as an admin
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const selectAdminUsersQuery = "SELECT * FROM user_profile WHERE role = 'admin'";

      db.query(selectAdminUsersQuery, (err, adminUsers) => {
        if (err) return res.status(500).json(err);
  
        // Return the retrieved posts in the response
        return res.status(200).json(adminUsers);
      });
    });
};

export const deleteAdminUser = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        
        // Ensure the authenticated user is an admin
        if (userInfo.role !== 'admin') {
            return res.status(403).json("Unauthorized access. You must be an admin to perform this action.");
        }
        const userId = req.params.id;
        
        // Query to get the role of the user to be deleted
        const selectUserQuery = "SELECT role FROM user_profile WHERE id = ?";
        
        db.query(selectUserQuery, [userId], (err, result) => {
            if (err) return res.status(500).json(err);
            
            // Check if the user to be deleted is also an admin
            if (result.length > 0 && result[0].role === 'admin') {
                // Query to delete the admin user by ID
                const deleteAdminQuery = "DELETE FROM user_profile WHERE id = ?";
        
                db.query(deleteAdminQuery, [userId], (err, result) => {
                    if (err) return res.status(500).json(err);
                    if (result.affectedRows > 0) {
                        return res.status(200).json("Admin user deleted successfully.");
                    } else {
                        return res.status(404).json("Admin user not found.");
                    }
                });
            } else {
                return res.status(400).json("You can only delete other admin users.");
            }
        });
    });
};


export const getAllUsers = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      const selectUsersQuery =`SELECT u.*, GROUP_CONCAT(p.language)
       AS languages, GROUP_CONCAT(p.skillset) AS skillsets
        FROM user_profile u LEFT JOIN user_programming p ON u.id = p.user_id 
        WHERE u.role = 'user' GROUP BY u.id`;

      db.query(selectUsersQuery, (err, users) => {
        if (err) return res.status(500).json(err);
  
        // Return the retrieved posts in the response
        return res.status(200).json(users);
      });
    });
};

export const deleteUser = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");
        
        // Ensure the authenticated user is an admin
        if (userInfo.role !== 'admin') {
            return res.status(403).json("Unauthorized access. You must be an admin to perform this action.");
        }
        const userId = req.params.id;
        
        // Query to get the role of the user to be deleted
        const selectUserQuery = "SELECT role FROM user_profile WHERE id = ?";
        
        db.query(selectUserQuery, [userId], (err, result) => {
            if (err) return res.status(500).json(err);
            
            if (result.length > 0 && result[0].role === 'user') {
                // Query to delete the user by ID
                const deleteAdminQuery = "DELETE FROM user_profile WHERE id = ?";
        
                db.query(deleteAdminQuery, [userId], (err, result) => {
                    if (err) return res.status(500).json(err);
                    if (result.affectedRows > 0) {
                        return res.status(200).json("User deleted successfully.");
                    } else {
                        return res.status(404).json("User not found.");
                    }
                });
            } else {
                return res.status(400).json("You can only delete users.");
            }
        });
    });
};


//Admin API
export const getAllPosts = (req, res) => {
    // Check if the user is authenticated as an admin
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        // Query the database to retrieve all posts ordered by the latest
        const query = `SELECT p.*, u.id AS user_id, u.name, u.profilePic
        FROM user_post AS p
        JOIN user_profile AS u ON u.id = p.user_id
        ORDER BY p.created_datetime DESC`;
  
        db.query(query, (err, posts) => {
            if (err) return res.status(500).json(err);
    
            // Return the retrieved posts in the response
            return res.status(200).json(posts);
        });
    });
};
  
export const adminDeletePost = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
        "DELETE FROM user_post WHERE `id`=?";

        db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
        });
    });
};

export const deleteComment = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const comment_id = req.params.id;
      const q = "DELETE FROM post_comment WHERE `id` = ?";
  
      db.query(q, [comment_id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Comment has been deleted!");
        });
    });
};

export const deleteReply = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const reply_id = req.params.id;
      const q = "DELETE FROM reply WHERE `id` = ?";
  
      db.query(q, [reply_id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Comment has been deleted!");
        });
    });
};