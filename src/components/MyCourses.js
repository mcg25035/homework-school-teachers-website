import React from 'react';
import { useStudentCourses, useLoginStatus } from '../api'; // Import useLoginStatus

const MyCourses = () => {
  const { user, isLoading: isAuthLoading, isLoggedIn } = useLoginStatus();

  // Get userId if user is logged in and user object is available
  const userId = user && isLoggedIn ? user.user_id : null;

  // Pass userId to useStudentCourses. Hook will not fetch if userId is null.
  const { courses, isLoading: isLoadingCourses, isError } = useStudentCourses(userId);

  // Handle auth loading state
  if (isAuthLoading) {
    return <div>Loading user information...</div>;
  }

  // Handle case where user is not logged in or userId could not be determined
  if (!userId) {
    // This message might need adjustment based on whether isLoggedIn is false or user object is missing user_id
    if (!isLoggedIn) {
        return <div>Please log in to view your courses.</div>;
    }
    return <div>Could not determine user ID. Unable to fetch courses.</div>;
  }

  // Handle courses loading state
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
      {courses.length === 0 ? (
        <p>You are not enrolled in any courses.</p>
      ) : (
        <ul>
          {courses.map(course => (
            // Ensure unique key: course.id might not be unique if enrollments have their own IDs
            // Assuming the transformation in useStudentCourses ensures 'id' is course_id
            <li key={course.id || course.course_id}>{course.name || course.course_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCourses;
