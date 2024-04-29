import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";

import {
  AddCircleOutlineRounded,
  RemoveCircleOutlineRounded,
} from "@mui/icons-material";

import axios from "axios";

const InputCourse = ({ setUser }) => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [availableCourses, setAvailableCourses] = useState();

  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000" + "/api/courses",
        { withCredentials: true }
      );

      console.log({ response });

      if (response.status === 200) {
        setAvailableCourses(response.data.courses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };
  useEffect(() => {
    // Call the function to fetch course names when the component mounts
    fetchCourses();
  }, []);

  useEffect(() => {
    if (availableCourses) setLoading(false);
  }, [availableCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ([courseName.trim(), courseCode.trim()].includes("")) {
      alert("Please fill all course details");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000" + "/api/add-course",
        {
          courseName,
          courseCode,
          capacity,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        alert("Course added successfully");
        const newAvailableCourses = [
          ...availableCourses,
          {
            courseName,
            courseCode,
            capacity,
            active: true,
          },
        ];
        setAvailableCourses(newAvailableCourses);
        setCourseName("");
      }
    } catch (err) {
      alert("Failed to add the course");
      console.error("Error adding course:", err);
    }
    console.log(`Submitted course name: ${courseName}`);
  };

  const deactivateCourse = (course) => {
    const val = window.confirm("Confirm deactivation?");
    if (!val) return;

    axios
      .post(
        "http://localhost:3000" + `/api/deactivateCourse/${course.id}`,
        null,
        { withCredentials: true }
      )
      .then((res) => {
        console.log({ res });

        setLoading(true);
        setAvailableCourses(null);
        fetchCourses();
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  const activateCourse = (course) => {
    const val = window.confirm("Confirm reactivation?");
    if (!val) return;

    axios
      .post(
        "http://localhost:3000" + `/api/activateCourse/${course.id}`,
        null,
        { withCredentials: true }
      )
      .then((res) => {
        console.log({ res });

        setLoading(true);
        setAvailableCourses(null);
        fetchCourses();
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return (
    <Box className="">
      <Grid container>
        {/* <LeftMenu setUser={setUser} /> */}
        <Grid item xs className="mx-5 pt-5">
          <Box
            style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            className="shadow px-4 py-3"
          >
            <Typography variant="h5" gutterBottom className="fw-bold mb-4">
              Course Details
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container className="mb-3" spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    placeholder="Probability and Statistics"
                    helperText="Course Name"
                    variant="outlined"
                    fullWidth
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    placeholder="AB01032"
                    helperText="Course Code"
                    variant="outlined"
                    fullWidth
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    placeholder="AB01032"
                    helperText="Course Intake"
                    variant="outlined"
                    fullWidth
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box className="d-flex justify-content-center">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ fontSize: "1rem" }}
                >
                  Add Course
                </Button>
              </Box>
            </form>
          </Box>
          <Box
            className="shadow container my-4 py-3 px-4"
            style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
          >
            <Typography
              variant="h5"
              gutterBottom
              className="fw-bold"
              style={{ display: "flex", alignItems: "center" }}
            >
              Courses List
              {loading && (
                <CircularProgress
                  style={{ height: "2rem", width: "2rem", marginLeft: "2rem" }}
                />
              )}
            </Typography>
            {!loading && (
              <>
                <Grid container spacing={2} className="my-3">
                  {availableCourses
                    ?.sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                    .filter((c) => c.active === true)
                    .map((course, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={"course-card-" + index}
                      >
                        <div
                          style={{
                            background: "#eee",
                            padding: "0.3rem 1rem",
                            height: "100%",
                            borderRadius: "5px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              cursor: "pointer",
                              backgroundColor: "white",
                              borderRadius: "50%",
                            }}
                            onClick={() => deactivateCourse(course)}
                          >
                            <RemoveCircleOutlineRounded
                              style={{ color: "red" }}
                            />
                          </div>
                          <Typography style={{ fontWeight: 600 }}>
                            {course.courseName}
                          </Typography>
                          <Typography>
                            {course.courseCode} ({course.capacity})
                          </Typography>
                        </div>
                      </Grid>
                    ))}
                </Grid>

                {availableCourses.filter((c) => c.active === false).length >
                  0 && (
                  <Typography variant="h6" className="my-3">
                    Deactivated Courses
                  </Typography>
                )}
                <Grid container spacing={2} className="">
                  {availableCourses
                    ?.sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                    .filter((c) => c.active === false)
                    .map((course, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={"course-card-" + index}
                      >
                        <div
                          style={{
                            background: "#eee",
                            padding: "0.3rem 1rem",
                            height: "100%",
                            borderRadius: "5px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              cursor: "pointer",
                              backgroundColor: "white",
                              borderRadius: "50%",
                            }}
                            onClick={() => activateCourse(course)}
                          >
                            <AddCircleOutlineRounded
                              style={{ color: "lightgreen" }}
                            />
                          </div>
                          <Typography style={{ fontWeight: 600 }}>
                            {course.courseName}
                          </Typography>
                          <Typography>
                            {course.courseCode} ({course.capacity})
                          </Typography>
                        </div>
                      </Grid>
                    ))}
                </Grid>
              </>
            )}
            {!loading && availableCourses.length === 0 && (
              <Typography>No Courses added yet!</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputCourse;
