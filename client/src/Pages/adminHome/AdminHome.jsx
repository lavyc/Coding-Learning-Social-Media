import "./adminHome.scss"
import AdminLeftBar from "../../components/adminLeftbar/AdminLeftBar";
import AdminNavbar from "../../components/adminNavbar/AdminNavbar";
import RegisterAdmin from "../../components/registerAdmin/RegisterAdmin";
import DeleteUser from "../../components/deleteUser/DeleteUser";
import Guideline from "../../components/guideline/Guideline";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState } from "react";
import AdminPost from "../../components/adminPost/AdminPost";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AdminHome = () => {
  const { darkMode } = useContext(DarkModeContext);
  const queryClient = new QueryClient();
  const [currentPage, setCurrentPage] = useState("adminPost");

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="home">
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <AdminNavbar />
          <div style={{ display: "flex" }}>
            <AdminLeftBar />
            <div style={{ flex: 6 }}>
              <div className="page-buttons">
                <button onClick={() => handlePageChange("adminPost")}>User Posts</button>
                <button onClick={() => handlePageChange("registerAdmin")}>Admin Page</button>
                <button onClick={() => handlePageChange("deleteUser")}>User Page</button>
                <button onClick={() => handlePageChange("guideline")}>Code of Conduct</button>
              </div>
              {currentPage === "adminPost" && <AdminPost />}
              {currentPage === "registerAdmin" && <RegisterAdmin />}
              {currentPage === "deleteUser" && <DeleteUser />}
              {currentPage === "guideline" && <Guideline />}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminHome