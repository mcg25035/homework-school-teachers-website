import React, { useState, useEffect } from 'react';
import {
  useCourse,
  useEnrollment,
  useUsers,
  createEnrollment,
  deleteEnrollment,
  useLoginStatus,
  // getUserById // Import if needed later
} from '../api';
import StudentInfo from './StudentInfo'; // Import StudentInfo
import { Container, Button, Form, ListGroup, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';

function ManageCourseEnrollment({ course_id, setActiveComponent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // Consolidated notification state
  const [notification, setNotification] = useState(null); // { type: 'success' | 'danger', message: '...' } | null

  const { user: loggedInUser, isLoading: isLoadingLoginStatus } = useLoginStatus();
  const { course, isLoading: isLoadingCourse, isError: isErrorCourse } = useCourse(course_id);
  const { enrollments, isLoading: isLoadingEnrollments, isError: isErrorEnrollments, revalidateEnrollments } = useEnrollment(course_id);

  // Debounce search term to prevent excessive API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { users: searchedUsers, isLoading: isLoadingSearch, isError: isErrorSearch } = useUsers(
    debouncedSearchTerm ? { username: debouncedSearchTerm } : null // Only search if debouncedSearchTerm is not empty
  );

  // Filter search results to exclude already enrolled students
  useEffect(() => {
    setSearchResults(prevResults => {
      let newFilteredResults = [];

      if (searchedUsers && Array.isArray(searchedUsers)) {
        if (enrollments && Array.isArray(enrollments) && enrollments.length > 0) {
          const enrolledStudentIds = enrollments.map(enrollment => enrollment.student_id);
          newFilteredResults = searchedUsers.filter(user => !enrolledStudentIds.includes(user.user_id));
        } else {
          newFilteredResults = searchedUsers;
        }
      }

      if (prevResults.length === newFilteredResults.length) {
        const prevIdsString = prevResults.map(u => u.user_id).sort().join(',');
        const newIdsString = newFilteredResults.map(u => u.user_id).sort().join(',');
        if (prevIdsString === newIdsString) {
          return prevResults;
        }
      }
      return newFilteredResults;
    });
  }, [searchedUsers, enrollments]);

  const handleAddStudent = async (userIdToAdd) => {
    setNotification(null);
    if (!course_id || !userIdToAdd) {
      setNotification({ type: 'danger', message: 'Course ID or User ID is missing.' });
      return;
    }
    const result = await createEnrollment({ course_id, user_id: userIdToAdd });
    if (result.success) {
      setNotification({ type: 'success', message: 'Student successfully enrolled.' });
      if (revalidateEnrollments) revalidateEnrollments();
      setSearchTerm('');
      setSearchResults([]);
    } else {
      setNotification({ type: 'danger', message: result.error || 'Failed to enroll student.' });
    }
  };

  const handleRemoveStudent = async (userIdToRemove) => {
    setNotification(null);
    if (!course_id || !userIdToRemove) {
      setNotification({ type: 'danger', message: 'Course ID or User ID is missing.' });
      return;
    }
    const result = await deleteEnrollment(course_id, userIdToRemove);
    if (result.success) {
      setNotification({ type: 'success', message: 'Student successfully removed.' });
      if (revalidateEnrollments) revalidateEnrollments();
    } else {
      setNotification({ type: 'danger', message: result.error || 'Failed to remove student.' });
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (isLoadingLoginStatus || isLoadingCourse) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading course details...</span>
        </Spinner>
        <p>Loading course details...</p>
      </Container>
    );
  }

  if (isErrorCourse) {
    return (
      <Container className="mt-3">
        <Alert variant="danger">Error loading course: {isErrorCourse.message || 'Unknown error'}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="mt-3">
        <Alert variant="warning">Course not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid="md" className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={() => setActiveComponent('CourseList')}>
            &larr; Back to Courses
          </Button>
          <Card.Title as="h2" className="mb-0">Manage Enrollments</Card.Title>
          <div style={{ minWidth: '120px' }}></div> {/* Spacer for centering title if needed */}
        </Card.Header>
        <Card.Body>
          <h4 className="mb-3 text-center">Course: {course.course_name || 'Unknown Course'}</h4>

          {notification && (
            <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible className="mt-3">
              {notification.message}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title as="h5">Enrolled Students</Card.Title>
                  {isLoadingEnrollments && (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" /> <p className="d-inline-block ms-2 mb-0">Loading students...</p>
                    </div>
                  )}
                  {isErrorEnrollments && (
                    <Alert variant="danger" className="mt-2">Error loading students: {isErrorEnrollments.message || 'Unknown error'}</Alert>
                  )}
                  {!isLoadingEnrollments && !isErrorEnrollments && enrollments && enrollments.length > 0 ? (
                    <ListGroup>
                      {enrollments.map(enrollment => (
                        <StudentInfo
                          key={enrollment.enrollment_id || enrollment.student_id}
                          studentId={enrollment.student_id}
                          onRemoveStudent={handleRemoveStudent}
                        />
                      ))}
                    </ListGroup>
                  ) : (
                    !isLoadingEnrollments && !isErrorEnrollments && <Alert variant="info" className="mt-2">No students are currently enrolled.</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title as="h5">Add Student</Card.Title>
                  <Form.Group controlId="searchStudentInput" className="my-3">
                    <Form.Label>Search by Username</Form.Label>
                    <Form.Control
                      type="search"
                      placeholder="Enter username..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>

                  {isLoadingSearch && debouncedSearchTerm && (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm"/> <p className="d-inline-block ms-2 mb-0">Searching...</p>
                    </div>
                  )}
                  {isErrorSearch && debouncedSearchTerm && (
                    <Alert variant="danger" className="mt-2">Error searching users: {isErrorSearch.message || 'Unknown error'}</Alert>
                  )}

                  {debouncedSearchTerm && !isLoadingSearch && !isErrorSearch && searchResults.length > 0 && (
                    <ListGroup>
                      {searchResults.map(user => (
                        <ListGroup.Item key={user.user_id} className="d-flex justify-content-between align-items-center">
                          {user.username} (ID: {user.user_id})
                          <Button variant="success" size="sm" onClick={() => handleAddStudent(user.user_id)}>Add</Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                  {debouncedSearchTerm && !isLoadingSearch && !isErrorSearch && searchResults.length === 0 && (
                    <Alert variant="info" className="mt-2">No users found matching your search, or all found users are already enrolled.</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ManageCourseEnrollment;
