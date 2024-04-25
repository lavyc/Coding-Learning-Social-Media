import "./adminNavbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { Link, useNavigate  } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import logo from '../../LoginAssets/logo.png'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Tooltip from '@mui/material/Tooltip';
import { makeRequest } from "../../axios";
import moment from "moment";

const AdminNavbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

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
      </div>
    </div>
  );
};

export default AdminNavbar;
