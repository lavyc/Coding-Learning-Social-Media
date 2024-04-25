import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const getUser = (req, res) => {
  const userId = req.params.user_id;

  const q = `
  SELECT 
    u.*,
    GROUP_CONCAT(p.language) AS languages,
    GROUP_CONCAT(p.skillset) AS skillsets
  FROM 
    user_profile u
  LEFT JOIN 
    user_programming p ON u.id = p.user_id
  WHERE 
    u.id=?
  GROUP BY
    u.id`;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { email, username, name, coverPic, profilePic } = req.body;
    const userId = userInfo.id;

    // Validate profile picture and cover picture format
    const validFormats = ["jpg", "jpeg", "png", "gif"]; // Add more valid formats if needed
    if (profilePic && !validFormats.some(format => profilePic.endsWith(format))) {
      return res.status(400).json("Invalid profile picture format. Please provide an image file.");
    }
    if (coverPic && !validFormats.some(format => coverPic.endsWith(format))) {
      return res.status(400).json("Invalid cover picture format. Please provide an image file.");
    }

    if (!email || !username || !name) {
        return res.status(400).json("Email, username, and name are required fields.");
    }
    
    try{
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email format
      if (!emailRegex.test(email)) {
        return res.status(400).json("Invalid email format. Please enter a valid email address.");
      }

      const q =
        "UPDATE user_profile SET `email`=?,`username`=?,`name`=?,`coverPic`=?, `profilePic`=? WHERE id=? ";

      db.query(
        q,
        [email, username, name, coverPic, profilePic, userId],
        (err, data) => {
          if (err) res.status(500).json(err);
          if (data.affectedRows > 0) return res.json("Updated!");
          return res.status(403).json("You can update only your post!");
        });
    }catch(error) {
      console.error('Error updating password:', error);
      return res.status(500).json("Internal server error");
    }
  });
};


export const updatePassword = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { newPassword } = req.body;
    const userId = userInfo.id;

    try {
      if (!newPassword) {
        return res.status(400).json("New password is required.");
      }

      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json("Password should have at least 6 characters.");
      }

      // Hash the new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt)

      // Update the password in the database
      const q = "UPDATE user_profile SET `password`=? WHERE id=? ";
      db.query(q, [hashedPassword, userId], (err, data) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json("Internal server error");
        }
        if (data.affectedRows > 0) {
          return res.json("Password updated successfully!");
        }
        return res.status(403).json("Failed to update password.");
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json("Internal server error");
    }
  });
};

export const getBadge = (req, res) => {
  const userId = req.params.user_id;
  const q = "SELECT *, (SELECT COUNT(*) FROM user_post WHERE user_id = ?) AS postCount FROM user_profile WHERE id=?";

  db.query(q, [userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);

    // Determine badge based on post count
    let badge = "No Badge";
    if (data[0].postCount >= 10) {
      badge = "Gold";
    } else if (data[0].postCount >= 5) {
      badge = "Silver";
    } else if (data[0].postCount >= 0) {
      badge = "Bronze";
    }
    // Add badge information to the response
    const responseData = {  ...data[0], badge };
    return res.json(responseData);
  });
};

export const updateProgramming = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { programmingLevel, programmingLanguages, selectedSkills} = req.body;
    const userId = userInfo.id;

    // Check if all inputs have values
    if (!programmingLevel || !programmingLanguages || !selectedSkills) {
      return res.status(400).json("All fields are required!");
    }

    try {
      // Update programming level in user_profile table
      const profileUpdateQuery = "UPDATE user_profile SET `programmingLevel`=? WHERE id=?";
      db.query(profileUpdateQuery, [programmingLevel, userId], (err, data) => {
        if (err) {
          console.error('Error updating programming level:', err);
          return res.status(500).json("Internal server error");
        }
        /*if (data.affectedRows > 0) {
          return res.json("Programming Level updated successfully!");
        }*/
      })

      // Update skills in user_programming table
      const deletePreviousSkillsQuery = "DELETE FROM user_programming WHERE user_id=?";
      db.query(deletePreviousSkillsQuery, [userId], (err, deletePreviousSkillsResult) => {
        if (err) {
          console.error('Error deleting previous skills:', err);
          return res.status(500).json("Internal server error");
        }
      })

      if (Array.isArray(programmingLanguages)) {
        // Insert new programming languages (limited to 5)
        const insertLanguagesQuery = "INSERT INTO user_programming (user_id, language) VALUES ?";
        const languageValues = programmingLanguages.slice(0, 5).map(language => [userId, language]); // Limit to 5 and use map
      
        db.query(insertLanguagesQuery, [languageValues], (err, result) => {
          if (err) {
            console.error('Error inserting new languages:', err);
            return res.status(500).json("Internal server error");
          }
        });
      };
      
      if (Array.isArray(selectedSkills)) {
        // Insert new skills into user_programming table
        const insertSkillsQuery = "INSERT INTO user_programming (user_id, language, skillset) VALUES ?";
        const skillsValues = selectedSkills.map(skill => [userId, null, skill]);
      
        db.query(insertSkillsQuery, [skillsValues], (err, insertSkillsResult) => {
          if (err) {
            console.error('Error inserting new skills:', err);
            return res.status(500).json("Internal server error");
          }
          return res.json("Programming profile updated successfully!");
        });
      };

    } catch (error) {
      console.error('Error updating programming profile:', error);
      return res.status(500).json("Internal server error");
    }
  });
};


export const getAllUsers = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const selectUsersQuery = 
    `SELECT * FROM user_profile 
      WHERE role = 'user' 
      AND id NOT IN (
        SELECT followings_userid FROM friendship WHERE followers_userid = ?
      )
      AND id != ?`;

    db.query(selectUsersQuery, [userInfo.id, userInfo.id], (err, users) => {
      if (err) return res.status(500).json(err);

      // Return the retrieved users in the response
      return res.status(200).json(users);
    });
  });
};

export const getFriends = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT u.id, u.name, u.profilePic
      FROM friendship AS f
      INNER JOIN user_profile AS u ON f.followers_userid = u.id
      WHERE f.followings_userid = ?
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);

      return res.status(200).json(data);
    });
  });
};





