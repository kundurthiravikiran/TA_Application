import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../../styles/ApplicationsDS.css";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  Modal,
  Typography,
  Chip,
} from "@mui/material";
import {
  ArrowDropDown,
  ArrowDropUp,
  DownloadRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";

const CourseChip = ({
  course,
  index,
  onToggle,
  isSelected,
  isRecommended,
  disabled,
}) => {
  console.log({ course });

  const handleClick = () => {
    onToggle(course);
  };

  if (disabled)
    return (
      <Chip
        variant={isRecommended ? "outlined" : "filled"}
        className="me-3"
        key={"course-" + index}
        label={course.courseName}
      />
    );

  return (
    <Chip
      color={"success"}
      variant={isSelected ? "filled" : "outlined"}
      className="me-3"
      onClick={handleClick}
      // endDecorator={isSelected && <Check />}
      key={index}
      label={course.courseName}
    />
  );
};

const PreviousTAChip = ({ course, index }) => {
  console.log({ course, index });

  return (
    <Chip
      variant="filled"
      className="me-3"
      key={"course-" + index}
      label={course.courseName}
    />
  );
};

let reject_g = false;

const ConfirmationModal = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ p: 4 }} className="modalBox">
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Confirm {reject_g ? "Rejection" : "Recommendation"}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Are you sure you want to{" "}
          {reject_g
            ? "reject this applicant for all the courses applied"
            : "recommend this applicant to the TA Committee with the selected courses"}
          ?
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
          <Button sx={{ mr: 1 }} variant="outlined" onClick={onClose}>
            No, go back
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm}>
            Yes, confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const ApplicationCard = ({
  application,
  setApplications,
  index,
  isOpen,
  setIsOpen,
}) => {
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [applicantIdToReview, setApplicantIdToReview] = useState(null);

  const handleReview = (applicantId, reject = false) => {
    reject_g = reject;

    setApplicantIdToReview(applicantId);
    setOpenConfirmation(true);
  };

  const confirmReview = async () => {
    setOpenConfirmation(false);

    try {
      const response = await axios.put(
        "http://localhost:3000" + `/api/updateApplicant/${applicantIdToReview}`,
        {
          ...application,
          review: true,
          DSCourses: reject_g ? [] : application.DSCourses,
          status: application.status.map((st) => {
            if (reject_g || st === "Pending") {
              return "Rejected";
            }
            return st;
          }),
        },
        { withCredentials: true }
      );
      setApplications((prevApplications) =>
        prevApplications.map((applicant) => {
          if (applicant.id === applicantIdToReview) {
            return {
              ...applicant,
              review: true,
            };
          }
          return applicant;
        })
      );
      alert(response.data.message);
      console.log(response.data.message);
    } catch (error) {
      console.error("Error rejecting the application:", error);
    }
  };

  const toggleCourseSelection = (course) => {
    setApplications((prevApplications) => {
      const newApplications = [...prevApplications];
      const targetedApplication = newApplications[index];
      const courseIndex = targetedApplication.DSCourses.indexOf(course);
      const cIndex2 = targetedApplication.eligibleCourses.indexOf(course);
      if (courseIndex > -1) {
        targetedApplication.DSCourses.splice(courseIndex, 1);
        targetedApplication.status[cIndex2] = "Pending";
      } else {
        targetedApplication.DSCourses.push(course);
        targetedApplication.status[cIndex2] = "In Review";
      }
      newApplications[index] = { ...targetedApplication };
      return newApplications;
    });
  };

  const downloadFile = async (filename) => {
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
      link.setAttribute("download", `${application.name}-resume.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <Card className="px-3 py-2 mb-3 shadow" key={index} variant="outlined">
      <Box
        className="d-flex align-items-center justify-content-between"
        onClick={() => {
          if (isOpen === index) {
            setIsOpen(-1);
          } else {
            setIsOpen(index);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <Typography
          variant="h6"
          className=""
          style={{
            width: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {application.name}
        </Typography>
        <Typography
          variant="body1"
          className="ms-2"
          style={{
            width: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {application.email}
        </Typography>
        <Button
          variant="text"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            downloadFile(application.resume);
          }}
        >
          CV{" "}
          <DownloadRounded
            style={{ fontSize: "1rem", transform: "translateY(2px)" }}
          />
        </Button>
        <Box className="d-flex align-items-center">
          <div style={{ width: "100px" }}>
            {application.review && (
              <>
                {application.DSCourses.length === 0 ? (
                  <div>Rejected</div>
                ) : (
                  <div>Recommended</div>
                )}
              </>
            )}
          </div>
          <ConfirmationModal
            open={openConfirmation}
            onClose={() => setOpenConfirmation(false)}
            onConfirm={confirmReview}
          />
          <Box className="ms-3 applicationCard">
            {isOpen === index ? (
              <ArrowDropUp className="fs-3" />
            ) : (
              <ArrowDropDown className="fs-3" />
            )}
          </Box>
        </Box>
      </Box>
      {isOpen === index && (
        <Box className="mt-3">
          {/* COURSES */}
          <Typography variant="body1" className="fw-bold">
            Courses{" "}
            <span className="fw-light">
              (
              {application.review
                ? "White outlined are recommended"
                : "Select courses to recommend to TA Committee"}
              )
            </span>
          </Typography>
          <Box className="mt-2 d-flex">
            {application.eligibleCourses?.map((course, index) => {
              console.log({ course });
              return (
                <CourseChip
                  course={course}
                  index={index}
                  onToggle={toggleCourseSelection}
                  isSelected={application.DSCourses?.includes(course)}
                  isRecommended={application.DSCourses?.map(
                    (c) => c.id
                  ).includes(course.id)}
                  key={index}
                  disabled={application.review}
                />
              );
            })}
          </Box>
          {/* PREVIOUS TEACHING ASSISTANT COURSES  */}
          {application.previousTACourses.length > 0 && (
            <>
              <Typography variant="body1" className="fw-bold mt-3">
                Previous Teaching Assistant Courses
              </Typography>
              <Box className="mt-2 d-flex">
                {application.previousTACourses?.map((course, index) => {
                  return (
                    <PreviousTAChip course={course} index={index} key={index} />
                  );
                })}
              </Box>
            </>
          )}
          {!application.review && (
            <Box className="d-flex justify-content-end mt-3">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleReview(application.id, true)}
                style={{ marginRight: "1rem", textTransform: "none" }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={application.DSCourses.length === 0}
                onClick={() => handleReview(application.id)}
              >
                Recommend
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
};

const ApplicationsDS = ({ setUser, user }) => {
  const [applications, setApplications] = useState(null);
  const [isOpen, setIsOpen] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000" + "/api/getApplicants",
          { withCredentials: true }
        );
        setApplications(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the applicants:", error);
      }
    };

    fetchApplicants();
  }, []);

  useEffect(() => {
    if (applications) setLoading(false);
  }, [applications]);

  return (
    <Box className="">
      <Grid container spacing={2}>
        {/* <LeftMenu setUser={setUser} user={user} /> */}
        <Grid item className="mx-5 pt-5" xs style={{ height: "100vh" }}>
          <Typography variant="h5" className="fw-bold my-3">
            Welcome, Department Staff
          </Typography>
          {applications?.length > 0 && (
            <Typography variant="h6" className="mt-2">
              {`${applications.length} Applicants`}
            </Typography>
          )}

          {applications?.length === 0 && (
            <Typography>No Applications yet</Typography>
          )}
          <Box className="mt-4 applicationRightBox px-2">
            {loading ? (
              <Box className="d-flex justify-content-center align-items-center h-100">
                <Typography variant="h3" className="fw-bold">
                  <CircularProgress />
                </Typography>
              </Box>
            ) : (
              applications.map((application, index) => {
                return (
                  <ApplicationCard
                    application={application}
                    setApplications={setApplications}
                    index={index}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    key={index}
                  />
                );
              })
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationsDS;
