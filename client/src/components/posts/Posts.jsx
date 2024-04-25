import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
//import { useEffect } from "react";

const Posts = ({ userId }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => {
      if (userId) {
        // Fetch posts for a specific user profile
        return makeRequest.get("/posts?user_id=" + userId).then((res) => {
          return res.data;
        });
      } else {
      // Fetch all posts for the home page
        return makeRequest.get("/posts").then((res) => {
          return res.data;
        });
      }
    },
  });

  return (
    <div className="posts">
      {error ? (
        "Something went wrong!"
      ) : isLoading ? (
        "Loading"
      ) : (
        Array.isArray(data) ? (
          data.map((post, index) => (
            <div key={index} className="Post">
              <Post post={post} />
            </div>
          ))
        ) : (
          <div>No posts available.</div>
        )
      )}
    </div>
  );
};

export default Posts;
