import React from 'react';
import { useUsers } from '../api';

function StudentInfo({ studentId, onRemoveStudent }) {
  // When useUsers is called with user_id, the 'users' field should contain the user object or null.
  const { users: user, isLoading, isError } = useUsers({ user_id: studentId });

  if (isLoading) {
    return <li className="list-group-item d-flex justify-content-between align-items-center">Loading student (ID: {studentId})...</li>;
  }

  if (isError) {
    return (
      <li className="list-group-item list-group-item-danger d-flex justify-content-between align-items-center">
        Error loading student (ID: {studentId}): {isError.message || 'Unknown error'}
        {/* Optionally, provide a way to retry or acknowledge the error if appropriate */}
      </li>
    );
  }

  if (!user) {
    return (
      <li className="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
        Student not found (ID: {studentId})
        {/* This could happen if the user_id is invalid or the user was deleted. */}
        {/* The parent component (ManageCourseEnrollment) might also want to handle this, e.g. by removing the enrollment if user not found */}
      </li>
    );
  }

  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      {user.username || `User ID: ${user.user_id}`} {/* Display username, fallback to user_id */}
      <button
        onClick={() => onRemoveStudent(studentId)}
        className="btn btn-danger btn-sm"
      >
        Remove
      </button>
    </li>
  );
}

export default StudentInfo;
