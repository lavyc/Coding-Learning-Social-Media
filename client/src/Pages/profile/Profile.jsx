import "./profile.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext"
import Update from "../../components/update/Update";
import UpdatePassword from "../../components/updatePassword/UpdatePassword";
import UpdateProgramming from "../../components/updateProgramming/UpdateProgramming";
import { useState, useEffect } from "react";
import goldbadge from '../../LoginAssets/goldbadge.png';
import silverbadge from '../../LoginAssets/silverbadge.png';
import bronzebadge from '../../LoginAssets/bronzebadge.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openUpdatePwd, setOpenUpdatePwd] = useState(false);
  const [openUpdatePrg, setOpenUpdatePrg] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [badgeData, setBadgeData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  //use location hook to take the path name and split it to get the user id
  const userId = parseInt(useLocation().pathname.split("/")[2]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => {
        return res.data;
      }),
  });
  
  //console.log(data)

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const response = await makeRequest.get(`/users/badge/${userId}`);
        setBadgeData(response.data);
      } catch (error) {
        console.error('Error fetching badge data:', error);
      }
    };

    fetchBadgeData();
  }, [userId]);


  const { isLoading: fIsLoading, data: friendshipData } = useQuery({
    queryKey: ["friendship"],
    queryFn: () =>
      makeRequest
        .get("/friendship?followings_userid=" + userId)
        .then((res) => res.data),
  });
  //console.log(friendshipData);
  

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (following) => {
      if (following) {
        return makeRequest.delete("/friendship?user_id=" + userId);
      }
      return makeRequest.post("/friendship", { user_id: userId });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["friendship"]);
    },
  });
  
  const ProfileMenu = ({ handleChangePassword, handlePrivacySettings, handleEditProfile }) => {
    return (
      <div className="profile-menu">
        <button onClick={handleChangePassword}>Change Password</button>
        <button onClick={handlePrivacySettings}>Account Settings</button>
        <button onClick={handleEditProfile}>Edit Programming Information</button>
      </div>
    );
  };

  const handleFollow = () => {
    mutation.mutate(friendshipData.includes(currentUser.id));
  };

  const handleChangePassword = () => {
    setOpenUpdatePwd(true);
  };
  
  const handlePrivacySettings = () => {
    setOpenUpdate(true);
  };
  
  const handleEditProfile = () => {
    setOpenUpdatePrg(true);
  };

  let badgeImage;
  if (badgeData && badgeData.badge === 'Gold') {
    badgeImage = goldbadge;
  } else if (badgeData && badgeData.badge === 'Silver') {
    badgeImage = silverbadge;
  } else if (badgeData && badgeData.badge === 'Bronze') {
    badgeImage = bronzebadge;
  }

  return (
    <div className="profile">
      {isLoading ? (
        "loading"
      ) : (
        <>
          <div className="images">
            {data.coverPic ? (
              <img src={"/upload/"+data.coverPic} alt="" className="cover" />
            ) : (
              <div className="add-cover-text">Cover Picture</div>
            )}
            {data.profilePic ? (
              <img src={"/upload/"+data.profilePic} alt="" className="profilePic" />
            ) : (
              <AccountCircleIcon className="profilePic" />
            )}
            </div>
          <div className="profileContainer">
            <div className="uInfo">
              <div className="left">
                {badgeData && (
                  <div className="badge-container">
                    {/* Display badge image */}
                    <img src={badgeImage} alt={`${badgeData.badge} Badge` } className="badge-image" />
                    <div className="badge-text">Badge: {badgeData.badge}</div>
                  </div>
                )}
              </div>
              <div className="center">
                <span>{data.name}</span>
                {fIsLoading ? (
                  "loading"
                ) : userId !== currentUser.id && (
                  <button onClick={handleFollow}>
                    {friendshipData.includes(currentUser.id) ? "Following" : "Follow"}
                  </button>
                )}
              </div>
              <div className="upperRight">
                {userId === currentUser.id && (
                  <>
                    <MoreHorizIcon onClick={handleMenuToggle} style={{ cursor: 'pointer' }} />
                    {menuOpen && (
                      <ProfileMenu 
                        handleChangePassword={handleChangePassword} 
                        handlePrivacySettings={handlePrivacySettings} 
                        handleEditProfile={handleEditProfile} 
                      />
                    )}
                  </>
                )}
              </div>
              <div className="right">
                <div>
                  <div>Username</div>                 
                  <span className="info">{data.username}</span>
                  <div>Email</div>
                  <span className="info">{data.email}</span>
                  <div>Programming Level</div>  
                  <span className="info">{data.programmingLevel}</span>
                  <div>Programming Language Interested</div> 
                  <span className="info">{data.languages}</span>
                  <div>Programming Skills</div>              
                  <span className="info">{data.skillsets}</span>
                </div>
              </div>
            </div>
            <Posts userId={userId} />
          </div>
        </>
      )}
        {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
        {openUpdatePwd && <UpdatePassword setOpenUpdatePwd={setOpenUpdatePwd} user={data} />}
        {openUpdatePrg && <UpdateProgramming setOpenUpdatePrg={setOpenUpdatePrg} user={data} />}
    </div>
  );
};

export default Profile;
