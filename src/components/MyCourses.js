import React from 'react';
import { Table } from 'react-bootstrap'; // Import Table
import { useStudentCourses, useLoginStatus } from '../api';

const MyCourses = () => {
  const { user, isLoading: isAuthLoading, isLoggedIn } = useLoginStatus();

  const userId = user && isLoggedIn ? user.user_id : null;

  const { courses, isLoading: isLoadingCourses, isError } = useStudentCourses(userId);

  if (isAuthLoading) {
    return <div>Loading user information...</div>;
  }

  if (!userId) {
    if (!isLoggedIn) {
        return <div>Please log in to view your courses.</div>;
    }
    return <div>Could not determine user ID. Unable to fetch courses.</div>;
  }

  if (isLoadingCourses) {
    return <div>Loading courses...</div>;
  }

  if (isError) {
    console.error("Failed to fetch courses:", isError);
    return <div>Error: Failed to load courses. Please try again later.</div>;
  }

  return (
    <div>
      <h1>My Courses</h1>
      {courses && courses.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>You are not enrolled in any courses.</p>
      )}
    </div>
  );
};

export default MyCourses;
