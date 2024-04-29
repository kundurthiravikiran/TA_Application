import React, { useState } from "react";
import { TextField, Button, Typography, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

import bgImg from "../assets/images/bg.jpg";

const Login = ({ setUserGlobal }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSignIn = () => {
    axios
      .post(
        "http://localhost:3000" + "/api/login",
        {
          username: credentials.username,
          password: credentials.password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setUserGlobal({ username: res.data.username, role: res.data.role });
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data);
      });

    setError("");

    // setCredentials({
    //   username: "",
    //   password: "",
    // });
  };

  return (
    <div
      style={{
        width: "max(400px, 100vw)",
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        background: `url('${bgImg}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div>
        <Typography variant="h5" style={{ fontWeight: 700 }}>
          Login
        </Typography>
        <Typography style={{ color: "#888", margin: "1rem 0 2rem 0" }}>
          Enter your credentials to access your account
        </Typography>
      </div>
      <div style={{ textAlign: "left" }}>
        <div>
          <label for="username">
            <Typography style={{ fontWeight: 500 }}>Username</Typography>
          </label>
          <TextField
            id="username"
            name="username"
            placeholder="m@example.com"
            required=""
            value={credentials.username}
            onChange={handleChange}
            style={{ width: "100%", backgroundColor: "white" }}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label for="password">
            <Typography style={{ fontWeight: 500 }}>Password</Typography>
          </label>
          <TextField
            id="password"
            required=""
            type="password"
            name="password"
            style={{ width: "100%", backgroundColor: "white" }}
            onChange={handleChange}
          />
        </div>

        {error && (
          <Box className="my-2">
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Button
          variant="contained"
          style={{ marginTop: "2rem", width: "100%", marginBottom: "2rem" }}
          onClick={handleSignIn}
        >
          Login
        </Button>

        <div>
          <Typography>
            Don't have an account?{" "}
            <span
              style={{ color: "rgb(23, 140, 239)", cursor: "pointer" }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Login;
