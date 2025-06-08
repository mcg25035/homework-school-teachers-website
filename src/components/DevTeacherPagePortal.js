import React, { useState } from 'react';
import { Button, Container, Card, Alert, Form } from 'react-bootstrap';
import TeacherSearch from './TeacherSearch';

function DevTeacherPagePortal({ setActiveComponent }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [error, setError] = useState('');

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleViewPageClick = () => {
    if (!selectedTeacher) {
      setError('Please select a teacher.');
      return;
    }

    if (setActiveComponent) {
      setActiveComponent('TeacherPublicPageView', { teacherId: selectedTeacher.user_id });
    } else {
      console.error('setActiveComponent prop is not available in DevTeacherPagePortal.');
      setError('Navigation function is not available.');
    }
  };

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">View Teacher Page</Card.Header>
        <Card.Body>
          <Form>
          <TeacherSearch setSelectedTeacher={handleTeacherSelect} />
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={handleViewPageClick} disabled={!selectedTeacher}>
              View Teacher Page
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DevTeacherPagePortal;
