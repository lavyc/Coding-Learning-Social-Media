import React, { useState, useEffect } from "react";
import "./ranking.scss";
import { makeRequest } from "../../axios";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";

const Ranking = ({ }) => {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await makeRequest.put("/comments/like");
        // Fetch updated user ranking after updating total likes
        const response = await makeRequest.get("/comments/rank");
        setUsers(response.data);
      } catch (error) {
        console.error("Error updating total likes:", error);
      }
    };
    fetchUsers();
  }, []);

   // Split users into first three and remaining users
   const firstThreeUsers = users.slice(0, 3);
   const remainingUsers = users.slice(3);
 
   return (
    <div className="home">
      <div className="ranking">
        {/* Display second user on the right */}
        {firstThreeUsers.length > 1 && (
          <div className="ranking-itemRight">
            <div className="user-info-container">
            {firstThreeUsers[1].profilePic ? (
              <Link to={`/profile/${firstThreeUsers[1].user_id}`}>
                <img src={"/upload/"+firstThreeUsers[1].profilePic} alt="" />
              </Link>
              ) : (
                <Link to={`/profile/${firstThreeUsers[1].user_id}`}>
                  <AccountCircleIcon className="profilePic" />
                </Link>
              )}
              <div>
                <span>{firstThreeUsers[1].username}</span>
                <div>Total likes: {firstThreeUsers[1].totalLikes}</div>
                <p>Rank 2</p>
              </div>
            </div>
          </div>
        )}
        {/* Display first user in the middle */}
        {firstThreeUsers.length > 0 && (
          <div className="ranking-itemMiddle">
            <div className="user-info-container">
            {firstThreeUsers[0].profilePic ? (
              <Link to={`/profile/${firstThreeUsers[0].user_id}`}>
                <img src={"/upload/"+firstThreeUsers[0].profilePic} alt="" />
              </Link>
              ) : (
                <Link to={`/profile/${firstThreeUsers[0].user_id}`}>
                  <AccountCircleIcon className="profilePic" />
                </Link>
              )}
              <div>
                <span>{firstThreeUsers[0].username}</span>
                <div>Total likes: {firstThreeUsers[0].totalLikes}</div>
                <p>Rank 1</p>
              </div>
            </div>
          </div>
        )}
        {/* Display third user on the left */}
        {firstThreeUsers.length > 2 && (
          <div className="ranking-itemLeft">
            <div className="user-info-container">
              {firstThreeUsers[2].profilePic ? (
                <Link to={`/profile/${firstThreeUsers[2].user_id}`}>
                  <img src={"/upload/"+firstThreeUsers[2].profilePic} alt="" />
                </Link>
              ) : (
                <Link to={`/profile/${firstThreeUsers[2].user_id}`}>
                  <AccountCircleIcon className="profilePic" />
                </Link>
              )}
              <div>
                <span>{firstThreeUsers[2].username}</span>
                <div>Total likes: {firstThreeUsers[2].totalLikes}</div>
                <p>Rank 3</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Display remaining users in a container below */}
      <div className="remaining-users">
        {remainingUsers.map((user, index) => {
          return (
          <div key={index} className="user-info-container">
            <div className="rank">Rank {index + 4}</div>
            {user.profilePic ? (
              <Link to={`/profile/${user.user_id}`}>
                <img src={"/upload/"+user.profilePic} alt="" />
              </Link>
            ) : (
              <Link to={`/profile/${user.user_id}`}>
                <AccountCircleIcon className="profilePic" />
              </Link>
            )}
            <div className="username">{user.username}</div>
            <p> Total likes: {user.totalLikes}</p>
          </div>  
          );
        })}
      </div>
    </div>
  );
};

export default Ranking;
