import AdminDeletePost from "../adminDeletePost/AdminDeletePost";
import "./adminPost.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const AdminPost = ({ }) => {
    
    const { isLoading, error, data } = useQuery({
        queryKey: ["posts"],
        queryFn: () => {
            return makeRequest.get("/admins/postAdmin").then((res) => {
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
                            <AdminDeletePost post={post} />
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

export default AdminPost;
