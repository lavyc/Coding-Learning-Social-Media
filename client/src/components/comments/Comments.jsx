import { useContext, useState, useEffect } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import Snackbar from '@mui/material/Snackbar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QuickreplyIcon from '@mui/icons-material/Quickreply';
import Reply from "../reply/Reply";
import { Link } from "react-router-dom";

const Comments = ({ post_id, recipientId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyingTo, setReplyingTo] = useState({ comment_id: null, username: null }); 
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
    };
  
    if (!isLoading && !error) {
      fetchReplyCounts();
    }
  }, [isLoading, error, data]);

  const queryClient = useQueryClient();

  //mutation for adding new comments
  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
      onSuccess: (data) => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);
        console.log(data);
        setSnackbarMessage("Comment is successfully added!");
        setSnackbarOpen(true);
      },
      onError: (error) => {
        console.error(error);
        setSnackbarMessage("Error adding a comment!");
        setSnackbarOpen(true);
      }
    });

  //mutation for adding new reply
  const replyMutation = useMutation({
    mutationFn: (newReply) => {
      return makeRequest.post("/comments/reply", newReply);
    },

      onSuccess: (data) => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["comments"]);
        setSnackbarMessage("Reply is successfully added!");
        setSnackbarOpen(true);
      },
      onError: (error) => {
        console.error(error);
        setSnackbarMessage("Error adding a reply!");
        setSnackbarOpen(true);
      }
  });
    const fetchCommentLikes = async () => {
      const likes = {};
      await Promise.all(data.map(async (comment) => {
        const response = await makeRequest.get("/comments/like", { params: { comment_id: comment.id } });
        likes[comment.id] = response.data;
      }));
      setCommentLikes(likes);
    };
  
    useEffect(() => {
      if (!isLoading && !error) {
        fetchCommentLikes();
      }
    }, [isLoading, error]);


    // Mutation for liking a comment
    const likeCommentMutation = useMutation({
      mutationFn:({ liked, comment_id }) => {
        //console.log(liked, comment_id);
        if (liked) {
          return makeRequest.delete("/comments/like",{ data: { comment_id: comment_id } });
        }
        return makeRequest.post("/comments/like", { comment_id: comment_id }); 
      },
      onSuccess: (data, { liked, comment_id }) => {
        // Update commentLikes state based on the mutation result
        const updatedCommentLikes = { ...commentLikes };
        if (liked) {
          // Remove current user's like from the comment
          updatedCommentLikes[comment_id] = updatedCommentLikes[comment_id].filter(userId => userId !== currentUser.id);
        } else {
          // Add current user's like to the comment
          updatedCommentLikes[comment_id] = [...updatedCommentLikes[comment_id], currentUser.id];
        }
        setCommentLikes(updatedCommentLikes);

        // Invalidate and refetch
        queryClient.invalidateQueries(["comments", post_id]);
      },
    });

  // Function to handle adding a new comment
  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ desc, post_id, recipientId });
    setDesc("");
  };

    // to handle liking a comment
    const handleLikeComment = (comment_id) => {
      //likeCommentMutation.mutate(comment_id);
      const liked = commentLikes[comment_id] && commentLikes[comment_id].includes(currentUser.id);
      likeCommentMutation.mutate({liked, comment_id});
    };
    
  // to handle clicking the quick reply icon
  const handleQuickReply = (comment_id, username) => {
    setReplyingTo({ comment_id: comment_id, username: username }); // Set the state to indicate which comment is being replied to and the username
    setReplyOpen(comment_id);
    //setDesc(`@${username} `);

  };

  // Function to handle sending a reply
  const handleSendReply = () => {
    //mutation.mutate({ desc, post_id, recipientId });
    replyMutation.mutate({ desc, comment_id: replyingTo.comment_id }); // Send the reply to the appropriate recipient
    setDesc(""); // Clear the reply text
    setReplyingTo({ comment_id: null, username: null }); // Reset the reply state
    setReplyOpen(null); // Close the reply box
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="comments">
      <div className="write">
        {currentUser.profilePic ? (
            <img src={"/upload/" + currentUser.profilePic} alt=""/>
        ) : (
            <AccountCircleIcon className="profilePic" />
        )}
        <textarea
          type="text"
          placeholder={replyingTo.username ? `Reply to ${replyingTo.username}` : "write a comment"}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={replyingTo.comment_id ? handleSendReply : handleClick}>Send</button>
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((comment) => (
            <div className="comment" key={comment.id}>
              {comment.profilePic ? (
                <Link to={`/profile/${comment.user_id}`}>
                  <img src={"/upload/" + comment.profilePic} alt=""/>
                </Link>
              ) : (
                <Link to={`/profile/${comment.user_id}`}>
                  <AccountCircleIcon className="profilePic" />
                </Link>
              )}
              <div className="info">
                <span>{comment.name}</span>
                <div className="comment-text">{comment.desc}</div>
                <div className="date">
                  {moment(comment.created_datetime).fromNow()}
                  <div className="reply">
                    {replyOpen  === comment.id && <Reply comment_id={comment.id}/>}
                  </div>
                </div>
              </div>
              <div className="comment-like">
                {/* Like button for comment */}
                <button onClick={() => handleLikeComment(comment.id)}>
                  {commentLikes[comment.id] && commentLikes[comment.id].includes(currentUser.id) ? (
                    <FavoriteOutlinedIcon 
                    style={{ color: "red" }}
                    onClick={handleLikeComment} />
                  ) : (
                    <FavoriteBorderOutlinedIcon onClick={handleLikeComment} />
                  )}
                </button>
                {commentLikes[comment.id] ? commentLikes[comment.id].length : 0} Likes
                <div onClick={() => handleQuickReply(comment.id, comment.name, comment.user_id) && setReplyOpen(comment.id)}>
                  <div className="count">
                    <QuickreplyIcon style={{ cursor: 'pointer' }}/>
                    {replyCounts[comment.id] ? replyCounts[comment.id].length : 0}
                  </div>
                </div>
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

export default Comments;
