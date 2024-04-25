import { useState } from "react";
import { makeRequest } from "../../axios";
import "./updatePassword.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';

const UpdatePassword = ({ setOpenUpdatePwd, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e) => {
    setNewPassword(e.target.value);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userData) => {
      return makeRequest.put("/users/updatePassword", userData);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries(["user"]);
      setSnackbarMessage("Password successfully updated!");
      setSnackbarOpen(true);
      console.log("Snackbar should be open now with success message.");
    },
    onError: (error) => {
      console.error(error);
      setSnackbarMessage("Error on Updating the Password!");
      setSnackbarOpen(true);
      console.log("Snackbar should be open now with error message.");
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // Perform mutation to update the password
    mutation.mutate({ id: user.id, newPassword });

  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="update-password">
      <div className="wrapper">
        <h1>Update Your Password</h1>
        <form>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            name="password"
            onChange={handleChange}
          />
          <button onClick={handleClick}>Update</button>
        </form>
        <button className="close" onClick={() => setOpenUpdatePwd(false)}>
          Close
        </button> 
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

export default UpdatePassword;
