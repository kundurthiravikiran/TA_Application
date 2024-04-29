import {
  Container,
  Typography,
  Box,
  Grid,
  Chip,
  Rating,
  Button,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import axios from "axios";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const FeedbackList = ({ setUser, user }) => {
  const [feedbacks, setFeedbacks] = useState(null);
  const [open, setOpen] = useState(-1);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (feedbacks) setLoading(false);
  }, [feedbacks]);

  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000" + `/api/getFeedbacks/${user.username}`,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setFeedbacks(response.data);
          console.log("Fetched feedbacks:", response.data);
        } else {
          console.error("Error fetching feedbacks:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchAllFeedbacks();
  }, [user]);

  console.log({ feedbacks });

  return (
    <Box>
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs className="my-4">
          <Container className="container">
            <Typography variant="h5" gutterBottom className="fw-bold my-3">
              All Feedbacks
            </Typography>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <CircularProgress />
              </div>
            ) : feedbacks.length === 0 ? (
              <Typography className="mt-4">No Feedbacks Yet</Typography>
            ) : (
              <Box>
                {feedbacks.map((feedback, index) => (
                  <Box
                    key={index}
                    className="my-2 shadow p-3 rounded"
                    style={{ backgroundColor: "white" }}
                  >
                    <Box
                      className="d-flex align-items-center justify-content-between"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        open === index ? setOpen(-1) : setOpen(index)
                      }
                    >
                      <Typography
                        variant="body1"
                        gutterBottom
                        className="me-5"
                        style={{ width: "100px" }}
                      >
                        {feedback.username}
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        className="fw-bold me-5"
                        style={{ width: "100px" }}
                      >
                        {feedback.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        className="fw-bold"
                      >
                        {feedback.email}
                      </Typography>
                      <div>
                        {open === index ? <ArrowDropUp /> : <ArrowDropDown />}
                      </div>
                    </Box>
                    {open === index && (
                      <Box>
                        <Chip
                          label={feedback.course.courseName}
                          className="me-3 my-2"
                          color="primary"
                        />
                        <Box>
                          <Rating
                            name="rating"
                            value={feedback.rating}
                            readOnly
                            className="my-2"
                          />
                        </Box>
                        <Typography
                          variant="body1"
                          gutterBottom
                          className="border p-2 mt-2"
                        >
                          {feedback.feedback}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackList;
