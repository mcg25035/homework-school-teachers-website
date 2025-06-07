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

function ManageCourseEnrollment({ course_id, setActiveComponent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    if (searchedUsers && Array.isArray(searchedUsers) && enrollments && Array.isArray(enrollments)) {
      const enrolledUserIds = enrollments.map(enrollment => enrollment.user_id);
      const filteredResults = searchedUsers.filter(user => !enrolledUserIds.includes(user.user_id));
      setSearchResults(filteredResults);
    } else if (searchedUsers && Array.isArray(searchedUsers)) {
      setSearchResults(searchedUsers); // No enrollments yet, show all search results
    } else {
      setSearchResults([]); // No search results or error
    }
  }, [searchedUsers, enrollments]);

  const handleAddStudent = async (userIdToAdd) => {
    setSuccessMessage('');
    setErrorMessage('');
    if (!course_id || !userIdToAdd) {
      setErrorMessage('Course ID or User ID is missing.');
      return;
    }
    const result = await createEnrollment({ course_id, user_id: userIdToAdd });
    if (result.success) {
      setSuccessMessage(`Student successfully enrolled.`);
      if (revalidateEnrollments) revalidateEnrollments(); // Revalidate enrollments list
      setSearchTerm(''); // Clear search term
      setSearchResults([]); // Clear search results
    } else {
      setErrorMessage(result.error || 'Failed to enroll student.');
    }
  };

  const handleRemoveStudent = async (userIdToRemove) => {
    setSuccessMessage('');
    setErrorMessage('');
    if (!course_id || !userIdToRemove) {
      setErrorMessage('Course ID or User ID is missing.');
      return;
    }
    const result = await deleteEnrollment(course_id, userIdToRemove);
    if (result.success) {
      setSuccessMessage(`Student successfully removed.`);
      if (revalidateEnrollments) revalidateEnrollments(); // Revalidate enrollments list
    } else {
      setErrorMessage(result.error || 'Failed to remove student.');
    }
  };

  // Clear messages after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (isLoadingLoginStatus || isLoadingCourse) return <p>Loading course details...</p>;
  if (isErrorCourse) return <p>Error loading course: {isErrorCourse.message || 'Unknown error'}</p>;
  if (!course) return <p>Course not found.</p>;

  // Assuming teacher is the logged-in user and course creator/teacher
  // Add additional permission checks if necessary based on your app's logic
  // For example, if course.teacher_id should match loggedInUser.user_id

  return (
    <div>
      <button onClick={() => setActiveComponent('CourseList')}>&larr; Back to Courses</button>
      <h2>Manage Enrollments for: {course.title}</h2>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <h3>Enrolled Students</h3>
      {isLoadingEnrollments && <p>Loading students...</p>}
      {isErrorEnrollments && <p>Error loading students: {isErrorEnrollments.message || 'Unknown error'}</p>}
      {enrollments && enrollments.length > 0 ? (
        <ul>
          {enrollments.map(enrollment => (
            <li key={enrollment.enrollment_id || enrollment.user_id}>
              {/* Assumption: enrollment object contains user.username or similar */}
              {enrollment.user?.username || `User ID: ${enrollment.user_id}`}
              <button
                onClick={() => handleRemoveStudent(enrollment.user_id)}
                style={{ marginLeft: '10px' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !isLoadingEnrollments && <p>No students are currently enrolled in this course.</p>
      )}

      <h3>Add Student</h3>
      <input
        type="text"
        placeholder="Search by username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* Search button can be added if preferred over search-on-type with debounce */}
      {/* <button onClick={() => setDebouncedSearchTerm(searchTerm)}>Search</button> */}

      {isLoadingSearch && debouncedSearchTerm && <p>Searching...</p>}
      {isErrorSearch && debouncedSearchTerm && <p>Error searching users: {isErrorSearch.message || 'Unknown error'}</p>}

      {debouncedSearchTerm && searchResults.length > 0 && (
        <ul>
          {searchResults.map(user => (
            <li key={user.user_id}>
              {user.username} (ID: {user.user_id})
              <button
                onClick={() => handleAddStudent(user.user_id)}
                style={{ marginLeft: '10px' }}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
      {debouncedSearchTerm && !isLoadingSearch && searchResults.length === 0 && (
        <p>No users found matching your search, or all found users are already enrolled.</p>
      )}
    </div>
  );
}

export default ManageCourseEnrollment;
