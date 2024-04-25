import { useState } from "react";
import { makeRequest } from "../../axios";
import "./addAdmin.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';

const AddAdmin = ({ setOpenRegAdmin }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (user) => {
      return makeRequest.post("/admins/register", user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]); // Invalidate and refetch admin users
      setSnackbarMessage("Admin user registered successfully!");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error(error);
      setSnackbarMessage("Error registering admin user.");
      setSnackbarOpen(true);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "username":
        setUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "name":
        setName(value);
        break;
      default:
        break;
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || !name) {
      setSnackbarMessage("All fields are required.");
      setSnackbarOpen(true);
      return;
    }
    mutation.mutate({ email, username, password, name });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="addUser">
      <div className="wrapper">
        <h1>Register New Admin</h1>
        <form>
          <label>Email</label>
          <input
            type="text"
            value={email}
            name="email"
            onChange={handleChange}
          />
          <label>Username</label>
          <input
            type="text"
            value={username}
            name="username"
            onChange={handleChange}
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            name="password"
            onChange={handleChange}
          />
          <label>Name</label>
          <input
            type="text"
            value={name}
            name="name"
            onChange={handleChange}
          />
          <button onClick={handleClick}>Register</button>
        </form>
        <button className="close" onClick={() => setOpenRegAdmin(false)}>
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

export default AddAdmin;
