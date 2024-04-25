import "./adminDeletePost.scss";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import AdminDeleteComment from "../adminDeleteComment/AdminDeleteComment";
import { useState, useEffect } from "react";
import moment from "moment";
import Snackbar from '@mui/material/Snackbar';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";

const AdminDeletePost = ({ post }) => {
    const [commentOpen, setCommentOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [numComments, setNumComments] = useState(null);

    const { data } = useQuery({
        queryKey: ["likes", post.id],
        queryFn: () =>
        makeRequest.get("/likes?post_id=" + post.id).then((res) => res.data),
    });

    // Query to get number of comments
    const { isLoading: isCommentsLoading, error: commentsError, data: commentsData } = useQuery({
        queryKey: ["comments", post.id],
        queryFn: async () => {
            try {
            const response = await makeRequest.get("/comments/num?post_id=" + post.id);
            return response.data ? response.data : []; // Ensure a defined value is returned
            } catch (error) {
            throw new Error("Error fetching comments data: " + error.message);
            }
        },
    });

    useEffect(() => {
        if (commentsData) {
            setNumComments(commentsData.length);
        }
    }, [commentsData]);

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (post_id) => {
        return makeRequest.delete("/admins/deletePost/" + post_id);
        },
        onSuccess: () => {
        // Invalidate and refetch the "posts" query
        queryClient.invalidateQueries(["posts"]);
        setSnackbarMessage("Post is deleted!");
        setSnackbarOpen(true);
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate(post.id);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const getMediaType = (filename) => {
        const extension = filename.split(".").pop().toLowerCase();
        if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
        return "image";
        } else if (["mp4", "avi", "mov", "mkv"].includes(extension)) {
        return "video";
        } else {
        return "file";
        }
    };

    return (
        <div className="post">
            <div className="container">
                <div className="user">
                    <div className="userInfo">
                        {post.profilePic ? (
                            <img src={"/upload/" + post.profilePic} alt=""/>
                        ) : (
                            <AccountCircleIcon className="profilePic" />
                        )}
                        <div className="details">
                            <span className="name">{post.name}</span>
                            <span className="date">{moment(post.created_datetime).fromNow()}</span>
                        </div>
                    </div>
                    <MoreHorizIcon
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ cursor: 'pointer' }}
                    />
                    {menuOpen && (
                        <button onClick={handleDelete}>Delete</button>
                    )}
                </div>
                <div className="content">
                    <div className="post-text">{post.desc}</div>
                    {post.media && (
                        <div className="media">
                        {getMediaType(post.media) === "image" && (
                            <img src={"/upload/" + post.media} alt="" />
                        )}
                        {getMediaType(post.media) === "video" && (
                            <video controls>
                            <source src={"/upload/" + post.media} type="video/mp4" />
                            Your browser does not support the video tag.
                            </video>
                        )}
                        {getMediaType(post.media) === "file" && (
                            <a href={"/upload/" + post.media} download>
                            <FolderZipIcon /> {post.media} {/* Display folder name */}
                            </a>
                        )}
                        </div>
                    )}
                </div>
                <div className="info">
                    <div className="item">
                        <FavoriteBorderOutlinedIcon />
                        {data && data.length} Likes
                    </div>
                    <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
                        <TextsmsOutlinedIcon />
                        {numComments !== null ? `${numComments}  ` : "Loading Comments..."}
                        Comments
                    </div>
                </div>
                {commentOpen && <AdminDeleteComment post_id={post.id}/>}
            </div>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackbarOpen}
                autoHideDuration={4000} // Adjust as needed
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </div>
    );
};

export default AdminDeletePost;
