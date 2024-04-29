import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Notifications } from "@mui/icons-material";
import "../../styles/ApplicationList.css";

const ApplicationList = ({ setUser, user }) => {
  const [applications, setApplications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fillApplications = (apps) => {
    const newApps = [];
    apps.forEach((app) => {
      app.eligibleCourses.forEach((course, index) => {
        newApps.push({
          course,
          status: app.status[index],
          index,
          id: app.id,
        });
      });
    });

    setApplications(newApps);
  };

  useEffect(() => {
    console.log({ applications });
  }, [applications]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000" + `/api/getApplicants?user=${user.username}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          fillApplications(response.data);
          setLoading(false);
        }
        const response2 = await axios.get(
          "http://localhost:3000" + `/api/notifications/${user.username}`,
          { withCredentials: true }
        );
        if (response2.status === 200) {
          setNotifs(response2.data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, [user.username]);

  const getStatusBGColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "In Review":
        return "info";
      case "Accepted":
        return "success";
      case "Approved":
        return "secondary";
      case "Rejected":
        return "error";
      default:
        return "secondary";
    }
  };

  const handleAccept = async (id, index, i) => {
    try {
      const response = await axios.post(
        "http://localhost:3000" + "/api/updateStatus",
        {
          applicantId: id,
          index,
          newStatus: "Accepted",
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Status updated successfully");
        const newApplications = [...applications];
        newApplications[i].status = "Accepted";
        setApplications(newApplications);
      }
    } catch (err) {
      alert("Failed to update status");
      console.error("Error updating status:", err);
    }
  };

  const handleNotifClose = async (id) => {
    const resp = await axios.delete(
      "http://localhost:3000" + `/api/notifications/${id}`,
      {
        withCredentials: true,
      }
    );
    if (resp.status === 200) {
      const newNotifs = notifs.filter((notif) => notif.id !== id);
      setNotifs(newNotifs);
    }
  };

  if (loading) {
    return (
      <Box>
        <Grid container>
          {/* <LeftMenu setUser={setUser} /> */}
          <Grid item xs>
            <Container className="container mt-4">
              <Typography variant="h5" gutterBottom className="fw-bold my-3">
                Applications
              </Typography>
              <Box
                className="text-center"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <CircularProgress />
              </Box>
            </Container>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs>
          <Container className="container mt-4">
            <Box className="notifContainer">
              <Badge badgeContent={notifs.length} color="primary">
                <Notifications
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                  }}
                  color="primary"
                  className="fs-2"
                  style={{ cursor: "pointer" }}
                />
              </Badge>
              {notifOpen &&
                notifs?.map((notif, index) => (
                  <Alert
                    key={index}
                    severity={"info"}
                    className="mt-2 notifAlert"
                    onClose={() => handleNotifClose(notif.id)}
                  >
                    {notif.message}
                  </Alert>
                ))}
            </Box>
            <Typography variant="h5" gutterBottom className="fw-bold my-3">
              Applications
            </Typography>
            <Box>
              {applications.length === 0 ? (
                <Typography>No Applications Yet</Typography>
              ) : (
                <TableContainer component={Paper} className="mb-4">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{ fontSize: "0.8rem", padding: "0.5rem" }}
                        >
                          <Typography className="fw-bold">Course</Typography>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "0.8rem",
                            width: "100px",
                            padding: "0.5rem",
                          }}
                        >
                          <Typography className="fw-bold">Code</Typography>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "0.8rem",
                            width: "200px",
                            padding: "0.5rem",
                          }}
                        >
                          <Typography className="fw-bold">Status</Typography>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "0.8rem",
                            width: "200px",
                            padding: "0.5rem",
                          }}
                        >
                          <Typography className="fw-bold">Action</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((application, index) => (
                        <TableRow key={index}>
                          <TableCell
                            style={{ fontSize: "0.8rem", padding: "0.5rem" }}
                          >
                            <Typography variant="button">
                              {application.course?.courseName}
                            </Typography>
                          </TableCell>
                          <TableCell
                            style={{ fontSize: "0.8rem", padding: "0.5rem" }}
                          >
                            <Typography variant="button">
                              {application.course?.courseCode}
                            </Typography>
                          </TableCell>
                          <TableCell
                            style={{ fontSize: "0.8rem", padding: "0.5rem" }}
                          >
                            <Chip
                              label={application.status.toUpperCase()}
                              className="text-white fw-bold"
                              color={`${getStatusBGColor(application.status)}`}
                            />
                          </TableCell>
                          <TableCell>
                            {application.status === "Approved" && (
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  handleAccept(
                                    application.id,
                                    application.index,
                                    index
                                  )
                                }
                              >
                                Accept
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationList;
