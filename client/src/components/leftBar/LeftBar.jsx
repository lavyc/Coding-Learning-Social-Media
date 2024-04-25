import "./leftBar.scss";
import ranking from '../../LoginAssets/ranking.png';
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";


const LeftBar = () => {

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);

  const { isLoading, data, error } = useQuery({
    queryKey: [""], 
    queryFn: () => 
    makeRequest.get('/users/friend').then((res) => res.data),
});


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
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (data) {
      setFriends(data);
    }
  }, [data]);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            {currentUser.profilePic ? (
              <Link to={`/profile/${currentUser.id}`}>
                <img src={"/upload/" + currentUser.profilePic} alt=""/>
              </Link>
            ) : (
              <Link to={`/profile/${currentUser.id}`}>
                <AccountCircleIcon className="profilePic" />
              </Link>
            )}
            <span>{currentUser.name}</span>
          </div>
          <Link to="/ranking" style={{ textDecoration: "none", cursor: 'pointer', color: 'black' }}>
            <div className="item">
              <img src={ranking} alt="" />
              <span>Ranking</span>
            </div>
          </Link>
          <div className="item">
            <LogoutIcon className="logout-icon" 
            onClick={handleLogout}
            style={{ cursor: 'pointer' }}/> 
            <span>Logout</span>
          </div>
          <div className="friend">
            <PersonAddIcon className="friend-icon"/> 
            <span>My Followers</span>
            {friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <Link to={`/profile/${friend.id}`}>
                  {friend.profilePic ? (
                    <img src={"/upload/" + friend.profilePic} alt={friend.name} />
                  ) : (
                    <AccountCircleIcon className="profilePic" />
                  )}
                </Link>
                <span>{friend.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
