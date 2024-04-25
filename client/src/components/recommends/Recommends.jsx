import Post from "../post/Post";
import "./recommends.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Recommends = ({ }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => {
        return makeRequest.get("/posts/recommend").then((res) => {
            return res.data;
        });
    },
  });

  return (
    <div className="Rposts">
      {error ? (
        <div className="no-posts">No recommended posts available.</div>
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

export default Recommends;
