import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import moment from "moment";
import { AuthContext } from "../../context/authContext"

const RightBar = () => {

  const [posts, setPosts] = useState([]);

  const { error: usersError, data: userData } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return makeRequest.get("/users/getUsers").then((res) => {
        return res.data;
      });
    },
  });

  // Fetch posts data
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await makeRequest.get("/posts/allPost");
        setPosts(response.data);
      } catch (error) {
        console.error("Error getting posts:", error);
      }
    };
    fetchPosts();
  }, []);


  if (usersError) return <div>Error: {usersError}</div>;

  const usersToShow = userData ? userData.slice(0, 10) : [];
  const latestPosts = posts ? posts.slice(0, 10) : [];

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {usersToShow.map(user => (
            <div key={user.id} className="user">
              <div className="userInfo">
                {user.profilePic ? (
                  <Link to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}>
                    <img src={"/upload/" + user.profilePic} alt=""/>
                  </Link>
                ) : (
                  <Link to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="profilePic">
                      <AccountCircleIcon className="profilePic" />
                    </div>
                  </Link>
                )}
                <Link to={`/profile/${user.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <span className="name">{user.name}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="item">
          <span>Latest Activities</span>
          {latestPosts.map(posts => {
            return (
              <div key={posts.id} className="user">
                <div className="userInfo">
                  <Link to={`/profile/${posts.user_id}`}
                    style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="name">{posts.name}</div>
                  </Link>
                  <Link to={`/posts/${posts.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="desc">{posts.desc}</div>
                  </Link>
                </div>
                <div className="date">{moment(posts.created_datetime).fromNow()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
