import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Recommends from "./components/recommendHome/RecommendHome";
import Searched from "./components/searched/Searched";
import Ranking from "./components/ranking/Ranking";
import PostByID from "./components/postbyID/PostByID";
import Home from "./Pages/home/Home";
import AdminHome from "./Pages/adminHome/AdminHome"
import Profile from "./Pages/profile/Profile";
import "./style.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();
  //fetching functions in any components

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex" }}>
            <LeftBar />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  //protect the route
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />; //go back to login page
    }

    if (currentUser.role === "admin") {
      return <Navigate to="/adminHome" />;
    }

    return children; //children is the layout
  };


  //router to the pages
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:id", //specific user profile based on id
          element: <Profile />,
        },
        {
          path: "/posts/:postId",
          element: <PostByID />
        },
        {
          path: "/recommend",
          element: <Recommends />
        },
        {
          path: "/search",
          element: <Searched />
        },
        {
          path: "/ranking",
          element: <Ranking />
        },
      ],
    },
    {
      path: "/adminHome",
      element: <AdminHome />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
