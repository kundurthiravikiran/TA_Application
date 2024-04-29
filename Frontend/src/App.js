import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ApplicationsDS,
  ApplicationsTC,
  Login,
  Signup,
  ApplicationForm,
  InputCourse,
  ApplicationList,
  Feedback,
  FeedbackList,
  FeedbackListDS,
  FeedbackListTC,
  FeedbackListStudent,
} from "./components";
import axios from "axios";
import "./styles/App.css";
import { Box, CircularProgress } from "@mui/material";
import Wrapper from "./components/Wrapper";
import Profile from "./components/Profile";

const App = () => {
  const [user, setUser] = useState(null);
  const handleSetUser = (user) => {
    setUser(user);
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000" + "/api/getUser", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  if (loading) {
    return (
      <Box
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", width: "100vw" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {user && (
          <Route path="/" element={<Wrapper user={user} />}>
            <Route
              path="/profile"
              element={<Profile setUser={handleSetUser} user={user} />}
            />
            {user && user.role === "Department Staff" && (
              <>
                <Route
                  path="/new-course"
                  element={<InputCourse setUser={handleSetUser} user={user} />}
                />
                <Route
                  path="/feedbacks"
                  element={
                    <FeedbackListDS setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ApplicationsDS setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/"
                  element={<Navigate to="/applications" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/applications" replace />}
                />
              </>
            )}
            {user && user.role === "TA Committee Member" && (
              <>
                <Route
                  path="/feedbacks"
                  element={
                    <FeedbackListTC setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ApplicationsTC setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/"
                  element={<Navigate to="/applications" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/applications" replace />}
                />
              </>
            )}
            {user && user.role === "Student" && (
              <>
                <Route
                  path="/apply"
                  element={
                    <ApplicationForm setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/feedbacks"
                  element={
                    <FeedbackListStudent setUser={handleSetUser} user={user} />
                  }
                />
                <Route
                  path="/application-list"
                  element={
                    <ApplicationList setUser={handleSetUser} user={user} />
                  }
                />
                <Route path="/" element={<Navigate to="/apply" replace />} />
                <Route path="*" element={<Navigate to="/apply" replace />} />
              </>
            )}
            {user && user.role === "Instructor" && (
              <>
                <Route
                  path="/feedback"
                  element={<Feedback setUser={handleSetUser} user={user} />}
                />
                <Route
                  path="/feedback-list"
                  element={<FeedbackList setUser={handleSetUser} user={user} />}
                />
                <Route
                  path="/"
                  element={<Navigate to="/feedback-list" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/feedback-list" replace />}
                />
              </>
            )}
          </Route>
        )}
        {!user && (
          <>
            <Route
              path="/signup"
              element={<Signup setUserGlobal={handleSetUser} user={user} />}
            />
            <Route
              path="/login"
              element={<Login setUserGlobal={handleSetUser} user={user} />}
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
