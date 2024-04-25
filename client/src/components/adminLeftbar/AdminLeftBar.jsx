import "./adminLeftBar.scss";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

const AdminLeftBar = () => {

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent going back to the previous page after logout
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', () => {
      navigate('/login');
    });

    return () => {
      window.removeEventListener('popstate', () => {
        navigate('/login');
      });
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8800/api/auth/logout'); 
      console.log("logout")
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            {currentUser.profilePic ? (
                <img src={"/upload/" + currentUser.profilePic} alt=""/>
            ) : (
                <div className="profilePic">
                  <AccountCircleIcon className="profilePic" />
                </div>
            )}
            <span>{currentUser.name}</span>
          </div>
          <div className="item">
            <LogoutIcon className="logout-icon" 
            onClick={handleLogout}
            style={{ cursor: 'pointer' }}/> 
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeftBar;
