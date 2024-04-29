import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

import bgImg from "../assets/images/bg.jpg";

const Signup = ({ setUserGlobal }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSignUp = () => {
    if (user.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Regular expression to check for at least one special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialCharRegex.test(user.password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    axios
      .post(
        "http://localhost:3000" + "/api/signup",
        {
          username: user.username,
          password: user.password,
          role: user.role,
        },
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res);
        setUserGlobal({ username: res.data.username, role: res.data.role });
        navigate("/");
      })
      .catch((err) => {
        console.log({ err });
        setError(err?.response?.data);
      });

    console.log("Sign Up", user);
    // setUser({
    //   username: "",
    //   password: "",
    //   confirmPassword: "",
    //   role: "",
    // });
    setError("");
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        background: `url('${bgImg}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <div>
        <Typography variant="h5" style={{ fontWeight: 700 }}>
          Sign Up
        </Typography>
        <Typography style={{ color: "#888", margin: "1rem 0 2rem 0" }}>
          Enter your information to create an account
        </Typography>
      </div>
      <div style={{ textAlign: "left", width: "300px" }}>
        <div>
          <label for="username">
            <Typography style={{ fontWeight: 500 }}>Username</Typography>
          </label>
          <TextField
            id="username"
            name="username"
            placeholder="m@example.com"
            required=""
            style={{ width: "100%", backgroundColor: "white" }}
            value={user.username}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label for="password">
            <Typography style={{ fontWeight: 500 }}>Password</Typography>
          </label>
          <TextField
            id="password"
            name="password"
            required=""
            type="password"
            style={{ width: "100%", backgroundColor: "white" }}
            value={user.password}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label for="confirm-password">
            <Typography style={{ fontWeight: 500 }}>
              Confirm Password
            </Typography>
          </label>
          <TextField
            id="confirm-password"
            name="confirmPassword"
            required=""
            type="password"
            style={{ width: "100%", backgroundColor: "white" }}
            value={user.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label for="role">
            <Typography style={{ fontWeight: 500 }}>Role</Typography>
          </label>
          <TextField
            id="role"
            name="role"
            select
            style={{ width: "100%", backgroundColor: "white" }}
            defaultValue={"Student"}
            value={user.role}
            onChange={handleChange}
          >
            <MenuItem value="Student">Student</MenuItem>
            <MenuItem value="TA Committee Member">TA Committee Member</MenuItem>
            <MenuItem value="Department Staff">Department Staff</MenuItem>
            <MenuItem value="Instructor">Instructor</MenuItem>
          </TextField>
        </div>

        {error && (
          <Box className="my-2">
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleSignUp}
          style={{ marginTop: "2rem", width: "100%", marginBottom: "2rem" }}
        >
          Sign Up
        </Button>

        <div>
          <Typography align="center">
            Already have an account?{" "}
            <span
              style={{ color: "rgb(23, 140, 239)", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Signup;
