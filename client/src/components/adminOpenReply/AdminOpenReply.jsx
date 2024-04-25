import "./adminOpenReply.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useState } from "react";
import Snackbar from '@mui/material/Snackbar';


const AdminOpenReply = ({ comment_id }) => {
    const [deleteButtonVisible, setDeleteButtonVisible] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    //query for replies
    const { isLoading, error, data } = useQuery({
        queryKey: ["comments", { comment_id }],
        queryFn: () => makeRequest.get("/comments/reply", { params: { comment_id } }).then((res) => res.data),
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (reply_id) => {
            console.log("delete")
            return makeRequest.delete("/admins/deleteReply/" + reply_id);
        },
        onSuccess: () => {
            // Invalidate and refetch the "posts" query
            queryClient.invalidateQueries(["comments"]);
            setSnackbarMessage("Reply is deleted!");
            setSnackbarOpen(true);
        },
    });

    const handleDelete = (reply_id) => {
        deleteMutation.mutate(reply_id);
    };

    const toggleDeleteButton = (reply_id) => {
        setDeleteButtonVisible(prevState => ({
            ...prevState,
            [reply_id]: !prevState[reply_id]
        }));
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    
  return (
    <div className="replies">
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((reply) => (
            <div className="comment" key={reply.id}>
              {reply.profilePic ? (
                <img src={"/upload/" + reply.profilePic} alt=""/>
              ) : (
                <AccountCircleIcon className="profilePic" />
              )}
              <div className="info">
                <span>{reply.name}</span>
                <div className="comment-text">{reply.desc}</div>
                <span className="date">
                    {moment(reply.created_datetime).fromNow()}
                </span>
              </div>
              <div className="more-icon">
                <MoreHorizIcon
                    onClick={() => toggleDeleteButton(reply.id)}
                    style={{ cursor: 'pointer' }}
                />
                    {deleteButtonVisible[reply.id] && (
                        <button onClick={() => handleDelete(reply.id)}>Delete</button>
                    )}
                </div>
            </div>
          ))}
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

export default AdminOpenReply;
