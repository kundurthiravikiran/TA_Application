import React, { useState } from "react";
import { Grid, Typography, Avatar, TextField, Button } from "@mui/material";
import axios from "axios";

const Profile = ({ user, setUser }) => {
  // Example user data - typically you would fetch this data from a server
  const [profile, setProfile] = useState({
    username: user.username,
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    zNumber: user.zNumber ?? "",
  });

  // Handle input change
  const handleChange = (prop) => (event) => {
    setProfile({ ...profile, [prop]: event.target.value });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .patch(
        "http://localhost:3000" + "/api/updateUser",
        {
          name: profile.name?.trim() ?? "",
          email: profile.email?.trim() ?? "",
          phone: profile.phone?.trim() ?? "",
          zNumber: profile.zNumber?.trim() ?? "",
        },
        { withCredentials: true }
      )
      .then((res) => {
        console.log({ res });

        setUser({
          ...user,
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          zNumber: profile.zNumber.trim(),
        });

        alert("Updated Successfully!");
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return (
    <div className="p-3">
      <Typography variant="h5" gutterBottom className="fw-bold my-3">
        Profile
      </Typography>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            md={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{ width: "150px", height: "150px", fontSize: "3rem", mt: 2 }}
            >
              {profile.name[0]}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              margin="normal"
              helperText="Username"
              variant="outlined"
              value={profile.username}
              onChange={handleChange("username")}
              InputProps={{ readOnly: true, style: { color: "#888" } }}
              style={{
                margin: 0,
                padding: 0,
                marginBottom: "0.8rem",
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              helperText="Name"
              variant="outlined"
              value={profile.name}
              onChange={handleChange("name")}
              style={{ margin: 0, padding: 0, marginBottom: "0.8rem" }}
            />
            <TextField
              fullWidth
              margin="normal"
              helperText="Z Number"
              variant="outlined"
              value={profile.zNumber}
              onChange={handleChange("zNumber")}
              style={{ margin: 0, padding: 0, marginBottom: "0.8rem" }}
            />
            <TextField
              fullWidth
              margin="normal"
              helperText="Email"
              variant="outlined"
              value={profile.email}
              onChange={handleChange("email")}
              style={{ margin: 0, padding: 0, marginBottom: "0.8rem" }}
            />
            <TextField
              fullWidth
              margin="normal"
              helperText="Phone Number"
              variant="outlined"
              value={profile.phone}
              onChange={handleChange("phone")}
              style={{ margin: 0, padding: 0, marginBottom: "0.8rem" }}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, float: "right" }}
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default Profile;
