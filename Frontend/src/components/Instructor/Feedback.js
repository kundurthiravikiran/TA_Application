import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Modal,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import axios from "axios";

const UserFeedbackModal = ({ user, open, onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:3000" + "/api/createFeedback",
        {
          ...user,
          feedback,
          rating,
        },
        { withCredentials: true }
      );

      alert("Feedback created successfully");
    } catch (error) {
      alert("Error creating feedback");
      console.error("Error creating feedback:", error);
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Container maxWidth="sm">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            width: "80vw",
            maxWidth: "400px",
          }}
        >
          <Typography className="fw-bold" variant="h6">
            User Information
          </Typography>
          <Typography variant="body1">
            <span
              style={{
                fontWeight: 600,
                width: "100px",
                display: "inline-block",
              }}
            >
              Username:
            </span>{" "}
            {user.username}
          </Typography>
          <Typography variant="body1">
            <span
              style={{
                fontWeight: 600,
                width: "100px",
                display: "inline-block",
              }}
            >
              Name:
            </span>{" "}
            {user.name}
          </Typography>
          <Typography variant="body1">
            <span
              style={{
                fontWeight: 600,
                width: "100px",
                display: "inline-block",
              }}
            >
              Email:
            </span>{" "}
            {user.email}
          </Typography>
          <Typography variant="body1">
            <span
              style={{
                fontWeight: 600,
                width: "100px",
                display: "inline-block",
              }}
            >
              Course:
            </span>{" "}
            {user.course.courseName}
          </Typography>
          <TextField
            label="Feedback"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-3"
          />
          <Box>
            <Typography className="mt-3 fw-bold">Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginTop: "16px" }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Container>
    </Modal>
  );
};

const Feedback = ({ setUser }) => {
  const [acceptedApplications, setAcceptedApplications] = useState(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const fillApplications = (apps) => {
    const newApplications = [];
    apps.forEach((app) => {
      app.eligibleCourses.forEach((course, index) => {
        if (app.status[index] === "Accepted") {
          newApplications.push({
            username: app.username,
            name: app.name,
            email: app.email,
            course,
          });
        }
      });
    });

    setAcceptedApplications(newApplications);
  };

  const fetchAcceptedApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000" + "/api/getAcceptedApplications",
        { withCredentials: true }
      );
      fillApplications(response.data);
    } catch (error) {
      console.error("Error fetching accepted applications:", error);
    }
  };

  useEffect(() => {
    fetchAcceptedApplications();
  }, []);

  useEffect(() => {
    if (acceptedApplications) setLoading(false);
  }, [acceptedApplications]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );

  return (
    <Box>
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs className="my-4">
          <Container className="container">
            <Typography
              variant="h5"
              gutterBottom
              className="fw-bold"
              style={{ marginBottom: "2rem" }}
            >
              TAs Appointed
            </Typography>
            <List>
              {acceptedApplications.map((user, index) => (
                <ListItem
                  key={`user-${index}-` + user.id}
                  className="p-3 mb-3 shadow rounded"
                  style={{ backgroundColor: "white" }}
                >
                  <ListItemText
                    primary={`${user.name} (${user.username})`}
                    secondary={
                      <Typography>
                        {user.email} <br />
                        <span style={{ fontWeight: 600 }}>
                          {user.course.courseName.toUpperCase()}
                        </span>
                      </Typography>
                    }
                    primaryTypographyProps={{
                      className: "fw-bold",
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)}
                  >
                    Feedback
                  </Button>
                  <UserFeedbackModal
                    user={user}
                    open={open}
                    onClose={() => setOpen(false)}
                  />
                </ListItem>
              ))}
            </List>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Feedback;
