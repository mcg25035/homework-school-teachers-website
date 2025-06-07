import React from 'react'; // Removed useState and useEffect as they are handled by the hook
import { useStudentCourses } from '../api'; // Import the new hook

const MyCourses = () => {
  const { courses, isLoading, isError } = useStudentCourses();

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  // useStudentCourses hook sets isError to an Error object if something went wrong.
  // We can display a generic message or inspect isError for more details if needed.
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
            // Assuming course objects have 'id' and 'name' properties
            <li key={course.id}>{course.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCourses;
