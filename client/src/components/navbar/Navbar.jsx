import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate  } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import logo from '../../LoginAssets/logo.png'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Tooltip from '@mui/material/Tooltip';
import { makeRequest } from "../../axios";
import moment from "moment";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [numToShow, setNumToShow] = useState(3);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try{
      if (!searchQuery || searchQuery.trim() === "") {
        console.error("Keywords are required for search.");
        return;
      }

    navigate(`/search?keywords=${encodeURIComponent(searchQuery)}`);

    }catch (error) {
      console.error("Error fetching posts:", error);
    };
  }

  const handleNotificationClick = async (notificationId) => {
    try {
      // Make a request to update the isRead status of the notification
      await makeRequest.put(`/notifications/noti`, { notificationId: [notificationId] });
      
      // Update the isRead status locally in the component state
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: 'yes' };
        }
        return notification;
      });
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };


  const loadMoreNotifications = () => {
    setNumToShow(numToShow + 3); // Increase by 3 each time "View More" is clicked
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await makeRequest.get("/notifications");
        const newNotifications = response.data;

        // Check if there are any unread notifications
        const unreadNotifications = newNotifications.some(notification => notification.isRead === 'no');
        //console.log(unreadNotifications) true
        setHasNewNotification(unreadNotifications);
        setNotifications(newNotifications);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        //setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);


  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewNotification(false); // Set hasNewNotification to false when opening notifications
    };
  };

  useEffect(() => {
    setDisplayedNotifications(notifications.slice(0, numToShow));
  }, [notifications, numToShow]);

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="logo-container">
            <img src={logo} alt="Logo Image" className="logo" />
            <span>LearnYourCode</span>
          </div>
        </Link>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Tooltip title="Home Page">
            <HomeOutlinedIcon />
          </Tooltip>
        </Link>
        <div className="mode">
          {darkMode ? (
            //icon can be changed
            <WbSunnyOutlinedIcon onClick={toggle} />
          ) : (
            <DarkModeOutlinedIcon onClick={toggle} />
          )}
        </div>
        <Link to="/recommend" style={{ textDecoration: "none" }}>
          <Tooltip title="For You Page">
            <GridViewOutlinedIcon />
          </Tooltip>
        </Link>

        <div className="search">
          <SearchOutlinedIcon />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

      </div>
      <div className="right">
        <div className="mode">
          <Tooltip title="Notifications">
            <div onClick={toggleNotifications}>
              <NotificationsOutlinedIcon />
              {hasNewNotification && <div className="newNoti" />}
            </div>
          </Tooltip>
        </div>
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
      </div>
      {isOpen &&  (
      <div className="notifications">
        {isLoading ? (
          <div>Loading...</div>
        ) : displayedNotifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          displayedNotifications.map((notification) => {
            let content = "";

            if (notification.type === 1) {
              // Type 1: Sender has liked recipient's post
              content = `${notification.sender_name} has liked your Post: ${notification.post_desc}`;
            } else if(notification.type === 2) {
              // Type 2: Sender has commented
              content = `${notification.sender_name} has commented on your Post: ${notification.post_desc}`;
            } else if(notification.type === 3){
              // Type 3: Sender has liked the comment 
              content = `${notification.sender_name} has liked your Comment: ${notification.comment_desc}`;
            } else{
              // Type 4: Sender has replied the comment 
              content = `${notification.sender_name} has replied to your Comment: ${notification.comment_desc}`;
            }

            return (
              <div key={notification.id} className={`notification ${notification.isRead === 'no' ? 'unread' : ''}`}  onClick={() => handleNotificationClick(notification.id)}>
                <Link to={`/posts/${notification.post_id}`}>
                  <span>{content}</span>
                </Link>
                <span className="timestamp">{moment(notification.created_datetime).fromNow()}</span>
              </div>
            );
          })
        )}
        {notifications.length > displayedNotifications.length && (
          <button onClick={loadMoreNotifications}>View More</button>
        )}
      </div>
    )}
    </div>
  );
};

export default Navbar;
