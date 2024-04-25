import Post from "../post/Post";
import "./postbyid.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";

const PostByID = ({ }) => {
    const postId = parseInt(useLocation().pathname.split("/")[2]);
    const { isLoading, error, data } = useQuery({
        queryKey: ["posts"],
        queryFn: () => {
            return makeRequest.get("/posts/" + postId).then((res) => {
                return res.data;
            });
        },
    });

    //console.log(data);

    return (
        <div className="home">
            <div className="posts">
            {error ? (
                <div className="no-posts">No posts available.</div>
            ) : isLoading ? (
                "Loading"
            ) : (
                <div className="Post">
                    <Post post={data} />
                </div>
            )}
            </div>
        </div>
    );
};

export default PostByID;
