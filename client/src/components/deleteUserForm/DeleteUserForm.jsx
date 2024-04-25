import { useState } from "react";
import { makeRequest } from "../../axios";
import "./deleteUserForm.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';

const DeleteUserForm = ({ setOpenDelUser }) => {
    const [userId, setUserId] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (userId) => {
            return makeRequest.delete("/admins/deleteUser/"+ userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"]);
            setSnackbarMessage("User deleted successfully!");
            setSnackbarOpen(true);
        },
        onError: (error) => {
            console.error(error);
            setSnackbarMessage("Error deleting user.");
            setSnackbarOpen(true);
        },
    });

    const handleChange = (e) => {
        setUserId(e.target.value);
      };

    const handleClick = async (e) => {
        e.preventDefault();
        if (!userId) {
          setSnackbarMessage("User ID is required.");
          setSnackbarOpen(true);
          return;
        }
        mutation.mutate(userId);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className="deleteUser">
            <div className="wrapper">
                <h1>Delete User</h1>
                <form>
                    <label>User ID</label>
                    <input
                        type="text"
                        value={userId}
                        name="userId"
                        onChange={handleChange}
                    />
                    <button onClick={handleClick}>Delete</button>
                </form>
                <button className="close" onClick={() => setOpenDelUser(false)}>
                    Close
                </button>
            </div>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </div>
    );
};

export default DeleteUserForm;
