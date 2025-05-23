import React, { useState } from 'react';
import { useLoginStatus, useCourse } from '../api'; // Keep existing imports
import { Table, Modal, Button, Form } from 'react-bootstrap'; // Add Modal, Button, Form imports
import CreateCourse from './CreateCourse'; // Keep CreateCourse import
import EditCourse from './EditCourse'; // Import EditCourse

function CourseList() {
  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null); // State for the course being edited
  const [showEditModal, setShowEditModal] = useState(false); // State for the edit modal visibility
  const { user, isLoggedIn } = useLoginStatus();

  const teacherId = user ? user.user_id : null;
  const { courses, isLoading, isError, mutate } = useCourse(null, teacherId); // Fetch courses for the logged-in teacher

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourseId(null); // Reset editing state
    setShowEditModal(false); // Close edit modal
  };

  const handleEditClick = (courseId) => {
    setEditingCourseId(courseId);
    setShowEditModal(true);
  };

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (isError) {
    return <div className="container">Error: Could not load courses.</div>;
  }

  // Ensure teacherId is available before rendering the list and button
  if (!isLoggedIn || !teacherId) {
      return <div className="container">請先登入以查看課程 (Please login first to view courses)</div>;
  }


  return (
    <div className="container">
      <button className="btn btn-primary mb-3" onClick={handleShowModal}>新增課程</button> {/* Use handleShowModal */}
      {courses && courses.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>課程名稱</th>
              <th>課程代號</th>
              <th>課程時間</th>
              <th>老師</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.course_id} onClick={() => handleEditClick(course.course_id)} style={{ cursor: 'pointer' }}> {/* Add onClick and cursor style */}
                <td>{course.course_name}</td>
                <td>{course.course_code}</td>
                <td>{course.time}</td>
                <td>{course.teacher_id}</td> {/* Display teacher ID for now */}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>您目前沒有任何課程</p>
      )}
      {/* Pass teacherId to CreateCourse and handle modal close */}
      <CreateCourse show={showModal} onHide={handleCloseModal} teacherId={teacherId} />

      {/* Edit Course Modal */}
      {editingCourseId && ( // Conditionally render based on editingCourseId
        <EditCourse show={showEditModal} onHide={handleCloseModal} courseId={editingCourseId} teacherId={teacherId} />
      )}
    </div>
  );
}

export default CourseList;
