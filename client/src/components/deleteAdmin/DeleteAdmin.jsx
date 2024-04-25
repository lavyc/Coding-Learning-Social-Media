import { useState } from "react";
import { makeRequest } from "../../axios";
import "./deleteAdmin.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';

const DeleteAdmin = ({ setOpenDelAdmin }) => {
    const [adminUserId, setAdminUserId] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    
    const queryClient = useQueryClient();
//"/comments/deleteComment/" + comment_id
    const mutation = useMutation({
        mutationFn: (userId) => {
            return makeRequest.delete("/admins/deleteAdmin/"+ userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["adminUsers"]); // Invalidate and refetch admin users
            setSnackbarMessage("Admin user deleted successfully!");
            setSnackbarOpen(true);
        },
        onError: (error) => {
            console.error(error);
            setSnackbarMessage("Error deleting admin user.");
            setSnackbarOpen(true);
        },
    });

    const handleChange = (e) => {
        setAdminUserId(e.target.value);
      };

    const handleClick = async (e) => {
        e.preventDefault();
        if (!adminUserId) {
          setSnackbarMessage("Admin user ID is required.");
          setSnackbarOpen(true);
          return;
        }
        mutation.mutate(adminUserId);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className="deleteUser">
        <div className="wrapper">
            <h1>Delete Admin</h1>
            <form>
                <label>Admin User ID</label>
                <input
                    type="text"
                    value={adminUserId}
                    name="adminUserId"
                    onChange={handleChange}
                />
                <button onClick={handleClick}>Delete</button>
            </form>
            <button className="close" onClick={() => setOpenDelAdmin(false)}>
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

export default DeleteAdmin;
