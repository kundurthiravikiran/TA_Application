import React, { useEffect } from "react";
import { useState } from "react";
import {
  Button,
  Container,
  Typography,
  Paper,
  Chip,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Table,
  TableContainer,
  Box,
  Grid,
  CircularProgress,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { DownloadRounded } from "@mui/icons-material";

const ApplicationsTC = ({ setUser }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fillApplications = (apps) => {
    console.log({ apps });

    const newApplications = [];
    apps.forEach((app) => {
      app.eligibleCourses.forEach((course, index) => {
        if (app.status[index] === "In Review") {
          newApplications.push({
            ...app,
            DSCourses: [course],
            index,
          });
        }
      });
    });

    console.log({ newApplications });

    setApplications(newApplications);
  };

  const handleApprove = async (id, index, i) => {
    try {
      const response = await axios.post(
        "http://localhost:3000" + "/api/updateStatus",
        {
          applicantId: id,
          index,
          newStatus: "Approved",
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Status updated successfully");
        const newApplications = [...applications];
        newApplications[i].status = "Approved";
        setApplications(newApplications);
      }
    } catch (err) {
      alert("Failed to update status");
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000" + "/api/getApplicants",
          { withCredentials: true }
        );

        fillApplications(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the applicants:", error);
      }
    };

    fetchApplicants();
  }, []);

  const downloadFile = async (name, filename) => {
    console.log({ name, filename });
    try {
      filename = filename.split("\\")[1];
      const response = await axios.get(
        "http://localhost:3000" + `/api/download-resume/${filename}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const file = new Blob([response.data], {
        type: "application/octet-stream",
      });

      const downloadUrl = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${name}-resume.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Box>
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs className="px-4" style={{ overflow: "auto" }}>
          <Typography variant="h5" className="fw-bold my-3">
            Welcome, TA Committee Member
          </Typography>
          {loading ? (
            <Box
              style={{
                display: "flex",
                width: "100%",
                height: "50vh",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" className=" fw-bold my-4 ms-3">
                {
                  applications.filter((application) =>
                    application.status.includes("In Review")
                  ).length
                }{" "}
                Applications
              </Typography>
              <Box
                className="px-2"
                style={{ height: "75vh", overflow: "auto" }}
              >
                <TableContainer component={Paper} className="shadow">
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ padding: "0.5rem" }}>
                          <Typography className="fw-bold">Name</Typography>
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0.5rem" }}>
                          <Typography className="fw-bold">
                            Selected Courses
                          </Typography>
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0.5rem" }}>
                          <Typography className="fw-bold">
                            Previous Courses
                          </Typography>
                        </TableCell>
                        <TableCell align="center" style={{ padding: "0.5rem" }}>
                          <Typography
                            className="fw-bold"
                            style={{ width: "60px" }}
                          >
                            CV
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications
                        .filter((application) =>
                          application.status.includes("In Review")
                        )
                        .map((application, index) => (
                          <TableRow key={index}>
                            <TableCell
                              component="th"
                              scope="row"
                              style={{ padding: "0.5rem" }}
                            >
                              {application.name}
                              <br />
                              {application.email}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{ padding: "0.5rem" }}
                            >
                              {application.DSCourses.map((course, index) => {
                                return (
                                  <Chip
                                    label={course.courseName}
                                    className="m-1"
                                    key={index}
                                  />
                                );
                              })}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{ padding: "0.5rem" }}
                            >
                              {application.previousTACourses.map(
                                (course, index) => {
                                  return (
                                    <Chip
                                      label={course.courseName}
                                      className="m-1"
                                      key={index}
                                    />
                                  );
                                }
                              )}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{ padding: "0.5rem" }}
                            >
                              <IconButton
                                variant="outlined"
                                color="primary"
                                onClick={() =>
                                  downloadFile(
                                    application.name,
                                    application.resume
                                  )
                                }
                              >
                                <DownloadRounded />
                              </IconButton>
                            </TableCell>
                            <TableCell style={{ padding: "0.5rem" }}>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  handleApprove(
                                    application.id,
                                    application.index,
                                    index
                                  )
                                }
                              >
                                Approve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationsTC;
