import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useEffect, useState } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterIcon,
  TwitterShareButton,
  WhatsappShareButton,
  WhatsappIcon,
  RedditShareButton,
  RedditIcon
} from "react-share";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [numComments, setNumComments] = useState(null);

  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
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

  const mutation = useMutation({
    mutationFn: (liked) => {
      if (liked) {
        return makeRequest.delete("/likes?post_id=" + post.id);
      }
      return makeRequest.post("/likes", { post_id: post.id, recipientId: post.user_id });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["likes"]);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (post_id) => {
      return makeRequest.delete("/posts/" + post_id);
    },
    onSuccess: () => {
      // Invalidate and refetch the "posts" query
      queryClient.invalidateQueries(["posts"]);
    },
  });
  
  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };
  

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
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

  const isCurrentUserPost = post.user_id === currentUser.id;

  const post_id= post.id;
  useEffect(() =>{
      const fetchShareUrl = async () => {
      try {
        const response = await makeRequest.get(`/posts/share/${post_id}`);
        const shareData = response.data;
        setShareData(shareData.desc);
        setShareUrl(shareData.url);
        console.log(shareUrl)
      } catch (error) {
        console.error("Error sharing post:", error);
      } 
    };
    if (shareMenuOpen) {
      fetchShareUrl();
    }
}, [shareMenuOpen, post_id]);

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            {post.profilePic ? (
              <img src={"/upload/" + post.profilePic} alt=""/>
            ) : (
              <AccountCircleIcon className="profilePic"/>
            )}
            <div className="details">
              <Link
                to={`/profile/${post.user_id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.created_datetime).fromNow()}</span>
            </div>
          </div>
          <>
            {isCurrentUserPost && (
              <MoreHorizIcon
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ cursor: 'pointer' }}
              />
            )}
            {menuOpen && isCurrentUserPost && (
              <button onClick={handleDelete}>delete</button>
            )}
          </>

        </div>
        <div className="content">
          <div className="post-text">{post.desc}</div>
          {/* Render media based on its type */}
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
        {/*likes on a post*/}
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : data && Array.isArray(data) && data.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data && data.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {numComments !== null ? `${numComments}  ` : "Loading Comments..."}
            Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon onClick={() => 
              {setShareMenuOpen(!shareMenuOpen)}} />
            Share
          </div>
          {shareMenuOpen && (
          <div className="share-menu">
            <EmailShareButton url={shareUrl}
            body={shareData}>
              <EmailIcon size={32} round />
            </EmailShareButton>
            <RedditShareButton url={shareUrl} 
            title={shareData}>
              <RedditIcon  size={32} round/>
            </RedditShareButton>
            <LinkedinShareButton url={shareUrl}
            title={shareData}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <WhatsappShareButton url={shareUrl}
            title={shareData}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <TwitterShareButton url={shareUrl}
            title={shareData}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
          </div>
        )}
      </div>
      {commentOpen && <Comments post_id={post.id} recipientId={post.user_id}/>}
      </div>
    </div>
  );
};

export default Post;
