import "./reply.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";

const Reply = ({ comment_id }) => {

  //query for replies
  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", { comment_id }],
    queryFn: () => makeRequest.get("/comments/reply", { params: { comment_id } }).then((res) => res.data),
  });

  return (
    <div className="replies">
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
                <span className="date">
                  {moment(comment.created_datetime).fromNow()}
              </span>
              </div>
            </div>
          ))}
    </div>
  );
};

export default Reply;
