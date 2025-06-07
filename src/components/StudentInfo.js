import React from 'react';
import { useUsers } from '../api';
import { ListGroup, Button, Spinner } from 'react-bootstrap';

function StudentInfo({ studentId, onRemoveStudent }) {
  const { users: user, isLoading, isError } = useUsers({ user_id: studentId });

  if (isLoading) {
    return (
      <ListGroup.Item as="li" className="d-flex justify-content-start align-items-center">
        <Spinner animation="border" size="sm" role="status" className="me-2">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        Loading student (ID: {studentId})...
      </ListGroup.Item>
    );
  }

  if (isError) {
    // Using variant="danger" for ListGroup.Item to indicate error
    return (
      <ListGroup.Item as="li" variant="danger" className="d-flex justify-content-between align-items-center">
        <span>Error loading student (ID: {studentId}): {isError.message || 'Unknown error'}</span>
        {/* Optionally, a retry button could be placed here if applicable */}
      </ListGroup.Item>
    );
  }

  if (!user) {
    // Using variant="warning" for ListGroup.Item
    return (
      <ListGroup.Item as="li" variant="warning" className="d-flex justify-content-between align-items-center">
        Student not found (ID: {studentId})
      </ListGroup.Item>
    );
  }

  return (
    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-center">
      <span>{user.username || `User ID: ${user.user_id}`}</span>
      <Button
        variant="danger"
        size="sm"
        onClick={() => onRemoveStudent(studentId)}
      >
        Remove
      </Button>
    </ListGroup.Item>
  );
}

export default StudentInfo;
