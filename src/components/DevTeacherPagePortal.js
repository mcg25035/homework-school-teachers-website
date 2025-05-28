import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';

function DevTeacherPagePortal({ setActiveComponent }) {
  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setTeacherIdInput(event.target.value);
    if (error) {
      setError(''); // Clear error when user starts typing
    }
  };

  const handleViewPageClick = () => {
    const numericId = parseInt(teacherIdInput, 10);
    if (isNaN(numericId) || numericId <= 0) {
      setError('Please enter a valid positive Teacher ID.');
      return;
    }
    setError(''); // Clear any previous error

    // Use setActiveComponent (passed as a prop) to navigate
    if (setActiveComponent) {
      setActiveComponent('TeacherPublicPageView', { teacherUserIdFromProp: numericId });
    } else {
      console.error('setActiveComponent prop is not available in DevTeacherPagePortal.');
      setError('Navigation function is not available.');
    }
  };

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">Developer Portal: View Teacher Page</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="teacherIdInput">
              <Form.Label>Teacher User ID</Form.Label>
              <Form.Control
                type="text" // Input type text to allow any input, validation done on submit
                placeholder="Enter Teacher User ID"
                value={teacherIdInput}
                onChange={handleInputChange}
                isInvalid={!!error}
              />
              {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
            </Form.Group>
            <Button variant="primary" onClick={handleViewPageClick}>
              View Teacher Page
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DevTeacherPagePortal;
