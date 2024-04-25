import { useState, useEffect } from "react";
import "./adminDeleteComment.scss";
import { makeRequest } from "../../axios";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Snackbar from '@mui/material/Snackbar';
import QuickreplyIcon from '@mui/icons-material/Quickreply';
import AdminOpenReply from "../adminOpenReply/AdminOpenReply";


const AdminDeleteComment = ({ post_id }) => {
    const [deleteButtonVisible, setDeleteButtonVisible] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [replyOpen, setReplyOpen] = useState(null);
    const [replyCounts, setReplyCounts] = useState({});

    //query for comments
    const { isLoading, error, data } = useQuery({
        queryKey: ["comments", { post_id }],
        queryFn: () => makeRequest.get("/comments", { params: { post_id } }).then((res) => res.data),
    });

    // Fetch reply counts for each comment
  useEffect(() => {
    const fetchReplyCounts = async () => {
      const counts = {};
      await Promise.all(data.map(async (comment) => {
        const response = await makeRequest.get("/comments/reply", { params: { comment_id: comment.id } });
        counts[comment.id] = response.data;
      }));
      setReplyCounts(counts);
      console.log(replyCounts)
    };
  
    if (!isLoading && !error) {
      fetchReplyCounts();
    }
  }, [isLoading, error, data]);

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (comment_id) => {
        return makeRequest.delete("/admins/deleteComment/" + comment_id);
        },
        onSuccess: () => {
        // Invalidate and refetch the "posts" query
        queryClient.invalidateQueries(["posts"]);
        setSnackbarMessage("Comment is deleted!");
        setSnackbarOpen(true);
        },
    });

    const handleDelete = (comment_id) => {
        deleteMutation.mutate(comment_id);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const toggleDeleteButton = (comment_id) => {
        setDeleteButtonVisible(prevState => ({
            ...prevState,
            [comment_id]: !prevState[comment_id]
        }));
    };


    return (
        <div className="comments">
            {error
                ? "Something went wrong"
                : isLoading
                ? "loading"
                : data.map((comment) => (
                    <div className="comment" key={comment.id}>
                        {comment.profilePic ? (
                            <img src={"/upload/" + comment.profilePic} alt=""/>
                        ) : (
                            <AccountCircleIcon className="profilePic" />
                        )}
                        <div className="info">
                            <span>{comment.name}</span>
                            <div className="comment-text">{comment.desc}</div>
                            <div className="date">
                                {moment(comment.created_datetime).fromNow()}
                                <div className="reply">
                                    {replyOpen  === comment.id && <AdminOpenReply comment_id={comment.id}/>}
                                </div>
                            </div>
                        </div>
                        <div className="more-icon">
                            <MoreHorizIcon
                                onClick={() => toggleDeleteButton(comment.id)}
                                style={{ cursor: 'pointer' }}
                            />
                            {deleteButtonVisible[comment.id] && (
                                <button onClick={() => handleDelete(comment.id)}>Delete</button>
                            )}
                            <div onClick={() => setReplyOpen(comment.id)}>
                                <QuickreplyIcon className="replyIcon"/>
                                {replyCounts[comment.id] ? replyCounts[comment.id].length : 0}
                            </div>
                        </div>
                    </div>
                ))
            }
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

export default AdminDeleteComment;
