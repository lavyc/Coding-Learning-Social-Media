import Post from "../post/Post";
import "./searched.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useSearchParams } from "react-router-dom";

const Searched = ({ }) => {
    const [searchParams] = useSearchParams();
    const keywords = searchParams.get("keywords");

    const { isLoading, error, data } = useQuery({
    queryKey: ["posts", keywords],
    queryFn: () => {
        return makeRequest.post("/posts/search",  { keywords }).then((res) => {
            return res.data;
        });
    },
  });

  return (
    <div className="home">
        <div className="posts">
        {error ? (
            <div className="no-posts">No posts available.</div>
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
    </div>
  );
};

export default Searched;
