import React, { useState, useRef } from 'react'; // Import useRef
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createCourse } from '../api';

function CreateCourse({ show, onHide, teacherId }) { // Accept teacherId prop
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitButtonRef = useRef(null); // Create a ref for the submit button

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const courseData = {
      course_name: courseTitle,
      description: courseDescription,
      course_code: courseCode,
    };

    // Pass courseData and teacherId to createCourse
    const result = await createCourse(courseData, teacherId);

    if (result.success) {
      setSuccess(true);
      setCourseTitle('');
      setCourseDescription('');
      setCourseCode('');
      // Revalidation is handled in performMutation now
      onHide(); // Close modal on success
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>新增課程</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">課程新增成功!</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="courseTitle">
            <Form.Label>課程名稱</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入課程名稱"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="courseCode">
            <Form.Label>課程代碼</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入課程代碼"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="courseDescription">
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
        <Button variant="primary" onClick={() => submitButtonRef.current.click()} disabled={loading}>
          {loading ? '新增中...' : '確認新增'}
        </Button>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          關閉
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateCourse;
