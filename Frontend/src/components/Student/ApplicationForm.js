import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Typography,
  Grid,
  Container,
  Checkbox,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AddCircle, CloseRounded } from "@mui/icons-material";

import PDFPreview from "../FilePreview";

const ApplicationForm = ({ setUser, user }) => {
  const navigate = useNavigate();

  const [preCourse, setPreCourse] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [previousCourses, setPreviousCourses] = useState([""]);
  const [eligibleCourses, setEligibleCourses] = useState([""]);
  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name,
    email: user.email,
    zNumber: user.zNumber,
    phoneNumber: user.phone,
    joiningDate: "",
    resume: null,
    description: "",
  });

  useEffect(() => {
    const fetchCourseNames = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000" + "/api/get-all-courses",
          { withCredentials: true }
        );

        if (response.status === 200) {
          setAvailableCourses(response.data.courses);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourseNames();
  }, []);

  useEffect(() => {
    if (!preCourse) setPreviousCourses([""]);
  }, [preCourse]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleMultiSelectChange = (event) => {
  // 	setFormData({
  // 		...formData,
  // 		[event.target.name]: event.target.value,
  // 	});
  // };

  const handlePreviousCourseChange = (event, index) => {
    const { value } = event.target;
    const newPreviousCourses = [...previousCourses];
    newPreviousCourses[index] = value;
    setPreviousCourses(newPreviousCourses);
    // setFormData({
    //   ...formData,
    //   previousCourses: newPreviousCourses,
    // });
  };

  const handleEligibleCourseChange = (event, index) => {
    const { value } = event.target;
    const newEligibleCourses = [...eligibleCourses];
    newEligibleCourses[index] = value;
    setEligibleCourses(newEligibleCourses);
    // setFormData({
    //   ...formData,
    //   eligibleCourses: newEligibleCourses,
    // });
  };

  const handleFileChange = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      resume: event.target.files[0],
    }));
  };

  function validateForm() {
    setEligibleCourses(
      eligibleCourses
        .filter((course) => course !== "")
        .filter((item, index, arr) => arr.indexOf(item) === index)
    );
    setPreviousCourses(
      previousCourses
        .filter((course) => course !== "")
        .filter((item, index, arr) => arr.indexOf(item) === index)
    );

    if (!formData.name) {
      return "Name is required. Please update your profile!";
    }

    if (!formData.zNumber) {
      return "Z Number is required. Please update your profile!";
    }

    if (!formData.email) {
      return "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Invalid email address. Please update your profile!";
    }

    if (!formData.phoneNumber) {
      return "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      return "Invalid phone number. Please update your profile!";
    }

    if (!formData.joiningDate) {
      return "Joining date is required.";
    }

    if (eligibleCourses.length === 0) {
      return "Eligible courses are required";
    }

    if (!formData.resume) {
      return "Resume is required";
    }

    return "";
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg !== "") {
      alert(errorMsg);
      return;
    }

    const data = new FormData();
    data.append("username", formData.username);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("zNumber", formData.zNumber);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("joiningDate", formData.joiningDate);
    data.append("description", formData.description);
    data.append(
      "previousCourses",
      JSON.stringify(
        previousCourses
          .filter((course) => course !== "")
          .filter((item, index, arr) => arr.indexOf(item) === index)
          .map((course) => availableCourses.find((el) => el.id === course))
      )
    );
    data.append(
      "eligibleCourses",
      JSON.stringify(
        eligibleCourses
          .filter((course) => course !== "")
          .filter((item, index, arr) => arr.indexOf(item) === index)
          .map((course) => availableCourses.find((el) => el.id === course))
      )
    );
    if (formData.resume) {
      data.append("resume", formData.resume);
    }

    // const response = await axios({
    //   method: "post",
    //   url: "/api/submitApplication",
    //   data: data,
    //   withCredentials: true,
    // });

    console.log({ formData });

    axios
      .post("http://localhost:3000" + "/api/submitApplication", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res.data);
        alert(res.data.message);

        navigate("/application-list");
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  };

  return (
    <Box className="mb-4">
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs>
          <Container className="container">
            <Typography variant="h5" className="fw-bold my-3">
              Welcome, Student
            </Typography>
            <Typography variant="h6" className="fw-bold my-3">
              Application Form
            </Typography>
            <form
              onSubmit={handleSubmit}
              style={{ backgroundColor: "white" }}
              className="shadow rounded p-5"
            >
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Typography style={{ padding: "0.5rem", width: "100%" }}>
                    Upload CV
                  </Typography>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    className="mb-3"
                    accept=".pdf"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      height: "300px",
                      backgroundColor: "#bbb",
                      borderRadius: "5px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                      border: "1px solid #aaa",
                    }}
                  >
                    {formData?.resume ? (
                      <PDFPreview
                        pdfUrl={URL.createObjectURL(formData.resume)}
                        style={{
                          width: "200px",
                          height: "300px",
                          margin: "auto",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "200px",
                          height: "300px",
                          backgroundColor: "#bbb",
                          borderRadius: "5px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "auto",
                        }}
                      >
                        No File chosen
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>

              <Grid container>
                {/* Username */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Username"
                    variant="outlined"
                    name="username"
                    value={formData.username}
                    className="mb-3 me-3"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Grid>
                {/* Name */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Name"
                    variant="outlined"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mb-3 ms-3"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Grid>
                {/* Email */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Email"
                    variant="outlined"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mb-3 me-3"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Grid>
                {/* Z Number */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Z Number"
                    variant="outlined"
                    name="zNumber"
                    value={formData.zNumber}
                    onChange={handleChange}
                    className="mb-3 ms-3"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Grid>
                {/* Phone Number */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Phone Number"
                    variant="outlined"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mb-3 me-3"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Grid>
                {/* Joining Date */}
                <Grid item xs={5}>
                  <TextField
                    helperText="Joining Date"
                    variant="outlined"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="mb-3 ms-3"
                    InputLabelProps={{ shrink: true }}
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
              {/* Previous Courses */}
              <Box className="border py-2 px-2 mb-4">
                <Box
                  className="d-flex align-items-center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setPreCourse(!preCourse)}
                >
                  <Checkbox
                    checked={preCourse}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                  <Typography variant="body1">Previous Course</Typography>
                </Box>
                {preCourse && (
                  <Box className="d-flex justify-content-center flex-column">
                    <Grid container className="d-flex align-items-center">
                      <Typography style={{ padding: "0.5rem", width: "100%" }}>
                        Choose previous courses
                      </Typography>

                      {previousCourses.map((course, index) => (
                        <React.Fragment key={"prev-course-" + index}>
                          <Grid
                            item
                            xs={8}
                            className="d-flex align-items-center"
                          >
                            <FormControl className="mb-2 mt-2" fullWidth>
                              {/* <InputLabel>Previous Courses</InputLabel> */}
                              <Select
                                name="previousCourses"
                                value={course}
                                onChange={(event) =>
                                  handlePreviousCourseChange(event, index)
                                }
                              >
                                {availableCourses?.map((course, index1) => (
                                  <MenuItem
                                    key={
                                      "available-pre-course-" +
                                      index +
                                      " - " +
                                      index1
                                    }
                                    value={course.id}
                                  >
                                    {course.courseName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <IconButton
                              onClick={() => {
                                if (previousCourses.length === 1)
                                  setPreviousCourses([""]);
                                else {
                                  let curr = [...previousCourses];
                                  curr.splice(index, 1);
                                  setPreviousCourses(curr);
                                }
                              }}
                            >
                              <CloseRounded />
                            </IconButton>
                          </Grid>
                          {index === previousCourses.length - 1 && (
                            <Grid item xs={3}>
                              <Button
                                variant="contained"
                                endIcon={<AddCircle />}
                                color="warning"
                                className="ms-4"
                                onClick={() =>
                                  setPreviousCourses([...previousCourses, ""])
                                }
                              >
                                ADD
                              </Button>
                            </Grid>
                          )}
                        </React.Fragment>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
              {/* Eligible Courses */}
              <Box className="border py-2 pt-4 px-2 mb-4">
                <Grid container className="d-flex align-items-center">
                  <Typography style={{ padding: "0.5rem", width: "100%" }}>
                    Choose eligible courses
                  </Typography>
                  {eligibleCourses.map((course, index) => (
                    <React.Fragment key={"eligible-course-" + index}>
                      <Grid item xs={8} className="d-flex align-items-center">
                        <FormControl className="mb-2 mt-2" fullWidth>
                          {/* <InputLabel>Eligible Courses</InputLabel> */}

                          <Select
                            name="eligibleCourses"
                            value={course}
                            onChange={(event) =>
                              handleEligibleCourseChange(event, index)
                            }
                          >
                            {availableCourses?.map((course, index1) => (
                              <MenuItem
                                key={
                                  "available-course-" + index + " - " + index1
                                }
                                value={course.id}
                              >
                                {course.courseName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <IconButton
                          onClick={() => {
                            if (eligibleCourses.length === 1)
                              setEligibleCourses([""]);
                            else {
                              let curr = [...eligibleCourses];
                              curr.splice(index, 1);
                              setEligibleCourses(curr);
                            }
                          }}
                        >
                          <CloseRounded />
                        </IconButton>
                      </Grid>
                      {index === eligibleCourses.length - 1 && (
                        <Grid item xs={3}>
                          <Button
                            variant="contained"
                            endIcon={<AddCircle />}
                            color="warning"
                            className="ms-4"
                            onClick={() =>
                              setEligibleCourses([...eligibleCourses, ""])
                            }
                          >
                            ADD
                          </Button>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>

              <TextField
                helperText="Cover Letter (about yourself, strengths, etc.)"
                multiline
                rows={3}
                variant="outlined"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mb-3"
                style={{ width: "100%" }}
              />
              {/* Resume */}

              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </form>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationForm;
