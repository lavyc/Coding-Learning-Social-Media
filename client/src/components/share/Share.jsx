import "./share.scss";
import FolderIcon from '@mui/icons-material/Folder';
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Snackbar from '@mui/material/Snackbar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload/", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
      setSnackbarMessage("Post has been successfully created.");
      setSnackbarOpen(true);
      console.log("Snackbar should be open now with success message.");

    },
    onError: (error) => {
      console.error(error);
      setSnackbarMessage("Description is required.");
      setSnackbarOpen(true);
      console.log("Snackbar should be open now with error message.");

    }
  });

  const handleClick = async (e) => {
    e.preventDefault();

    let mediaUrl = "";
    if (file) mediaUrl = await upload();
    const formData = new FormData();
    formData.append("file", file);

    // Create the new post with the media URL
    mutation.mutate({ desc, media: mediaUrl });
    setDesc("");
    setFile(null);
    
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            {currentUser.profilePic ? (
              <img src={"/upload/" + currentUser.profilePic} alt="" />
            ) : (
              <AccountCircleIcon className="profilePic" />
            )}
            <textarea
              type="text"
              placeholder={`What's on your mind?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {/* Display selected file */}
            {file && (
              <>
                {file.type.startsWith("image/") && (
                  <img className="file" alt="" src={URL.createObjectURL(file)} />
                )}
                {file.type.startsWith("video/") && (
                  <video className="file" controls>
                    <source src={URL.createObjectURL(file)} type={file.type} />
                  </video>
                )}
                {!file.type.startsWith("image/") && !file.type.startsWith("video/") && (
                  <div className="file">
                    <FolderIcon /> {file.name}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              accept=".jpg, .jpeg, .png, .gif, .mp4, .avi, .mov, .mkv, .doc, .docx, .pdf, .zip"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                  <FolderIcon />
                  <span>Add Image / Video / Folder</span>
                  <br/><br/>
                  <span>Accepted file type: .jpg, .jpeg, .png, .gif, .mp4, .avi, .mov, .mkv, .doc, .docx, .pdf, .zip</span>
              </div>
            </label>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>
      {/* Snackbar for displaying success/error messages */}
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

export default Share;
