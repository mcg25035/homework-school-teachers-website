import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useCourse, updateCourse } from '../api';

function EditCourse({ show, onHide, courseId, teacherId }) {
  const { course, isLoading, isError } = useCourse(courseId); // Fetch course data
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const submitButtonRef = useRef(null);

  // Populate form when course data is loaded or courseId changes
  useEffect(() => {
    if (course) {
      setCourseTitle(course.course_name || '');
      setCourseDescription(course.description || '');
      setCourseCode(course.course_code || '');
      setUpdateSuccess(false); // Reset success state on new course load
      setUpdateError(null); // Reset error state on new course load
    } else {
      // Clear form if no course is loaded (e.g., modal is hidden)
      setCourseTitle('');
      setCourseDescription('');
      setCourseCode('');
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    const courseData = {
      course_name: courseTitle,
      description: courseDescription,
      // Do not include course_code in update data as it's read-only
    };

    // Call updateCourse API
    const result = await updateCourse(courseId, courseData, teacherId);

    if (result.success) {
      setUpdateSuccess(true);
      // No need to manually mutate here, updateCourse in api.js handles it
      // Optionally, keep modal open briefly to show success message, then close
      setTimeout(onHide, 1500); // Close after 1.5 seconds
    } else {
      setUpdateError(result.error);
    }

    setUpdateLoading(false);
  };

  // Show loading/error for fetching course data
  if (isLoading) return <div>Loading course data...</div>;
  if (isError) return <div>Error loading course data.</div>;
  if (!course && show) return <div>Course not found.</div>; // Handle case where courseId is provided but no data is returned

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>編輯課程</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {updateError && <Alert variant="danger">{updateError}</Alert>}
        {updateSuccess && <Alert variant="success">課程更新成功!</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="editCourseTitle">
            <Form.Label>課程名稱</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入課程名稱"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editCourseCode">
            <Form.Label>課程代碼</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入課程代碼"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              readOnly // Make course_code read-only
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editCourseDescription">
            <Form.Label>課程描述</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="輸入課程描述"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
            />
          </Form.Group>

          {/* Hidden submit button inside the form, attach ref */}
          <Button type="submit" ref={submitButtonRef} style={{ display: 'none' }} />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {/* Button in footer that triggers the hidden submit button click */}
        <Button variant="primary" onClick={() => submitButtonRef.current.click()} disabled={updateLoading}>
          {updateLoading ? '更新中...' : '確認更新'}
        </Button>
        <Button variant="secondary" onClick={onHide} disabled={updateLoading}>
          關閉
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditCourse;
