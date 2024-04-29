import {
  AddBoxOutlined,
  AddOutlined,
  AddRounded,
  ExitToAppOutlined,
  LibraryBooksOutlined,
  PostAddOutlined,
  RecentActorsOutlined,
} from "@mui/icons-material";
import { Divider, IconButton, Avatar } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import axios from "axios";

import "./index.css";

const navItems = {
  Student: [
    {
      link: "/apply",
      icon: PostAddOutlined,
      label: "Apply",
    },
    {
      link: "/application-list",
      icon: RecentActorsOutlined,
      label: "Applications",
    },
    {
      link: "/feedbacks",
      icon: LibraryBooksOutlined,
      label: "Feedbacks",
    },
  ],
  "Department Staff": [
    {
      link: "/applications",
      icon: LibraryBooksOutlined,
      label: "Applications",
    },
    {
      link: "/feedbacks",
      icon: RecentActorsOutlined,
      label: "Feedbacks",
    },
    {
      link: "/new-course",
      icon: AddBoxOutlined,
      label: "Add Course",
    },
  ],
  "TA Committee Member": [
    {
      link: "/applications",
      icon: RecentActorsOutlined,
      label: "Applications",
    },
    {
      link: "/feedbacks",
      icon: RecentActorsOutlined,
      label: "Feedbacks",
    },
  ],
  Instructor: [
    {
      link: "/feedback-list",
      icon: RecentActorsOutlined,
      label: "Feedback List",
    },
    {
      link: "/feedback",
      icon: LibraryBooksOutlined,
      label: "Feedback",
    },
  ],
};

const SideNav = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        {user &&
          navItems[user.role].map((navitem, index) => {
            return (
              <div
                className="NavMenuItem"
                key={"navitem-" + index}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  margin: "10px",
                  color:
                    window.location.pathname === navitem.link
                      ? "#000"
                      : undefined,
                  backgroundColor:
                    window.location.pathname === navitem.link
                      ? "rgb(240, 240, 240)"
                      : "transparent",
                }}
                onClick={() => {
                  navigate(navitem.link);
                }}
              >
                <navitem.icon />
                &nbsp;&nbsp;&nbsp;
                {navitem.label}
              </div>
            );
          })}
      </div>
      <div
        style={{
          height: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
        }}
      >
        <Divider />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0px 10px",
          }}
        >
          <Avatar
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            {user.name?.[0] ?? "U"}
          </Avatar>
          <IconButton
            onClick={() => {
              axios
                .post("http://localhost:3000" + "/api/logout", null, {
                  withCredentials: true,
                })
                .then((res) => {
                  window.location.reload();
                });
            }}
          >
            <ExitToAppOutlined />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

const Wrapper = ({ user }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "200px",
          backgroundColor: "rgb(250, 250, 250)",
          border: "1px solid rgb(230, 230, 230)",
        }}
      >
        <SideNav user={user} />
      </div>
      <div style={{ flex: 1, height: "100vh", overflow: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Wrapper;
