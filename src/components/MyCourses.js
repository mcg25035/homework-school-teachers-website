import React from 'react'; // Removed useState as it's no longer needed
import { Table } from 'react-bootstrap'; // Import Table
import { useStudentCourses, useLoginStatus } from '../api';
// Removed CourseContent import as it's no longer directly rendered here

const MyCourses = ({ setActiveComponent }) => { // Receive setActiveComponent as a prop
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

  const handleCourseClick = (courseId) => {
    setActiveComponent('CourseContent', { course_id: courseId }); // Pass as course_id
  };

  return (
    <div>
      <h1>我的課程</h1>
      {courses && courses.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>課程名稱</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} onClick={() => handleCourseClick(course.id)} style={{ cursor: 'pointer' }}>
                <td>{course.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>您尚未註冊任何課程。</p>
      )}
    </div>
  );
};

export default MyCourses;
