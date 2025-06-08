import React, { useState, useEffect } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { useUsers } from '../api';

function TeacherSearch({ setSelectedTeacher, initialTeacher }) {
  const [teacherName, setTeacherName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (initialTeacher) {
      setTeacherName(initialTeacher.username);
    }
  }, [initialTeacher]);

  const { users: fetchedUsers } = useUsers({ teacher_username: teacherName });

  useEffect(() => {
    if (fetchedUsers) {
      setSearchResults(fetchedUsers);
      setShowDropdown(fetchedUsers.length > 0);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [fetchedUsers]);

  const handleNameChange = (e) => {
    setTeacherName(e.target.value);
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherName(teacher.username);
    setShowDropdown(false);
    
  };

  return (
    <div>
      <Form.Group className="mb-3" controlId="teacherName">
        <Form.Label>Teacher Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Teacher Username"
          value={teacherName}
          onChange={handleNameChange}
        />
      </Form.Group>

      {searchResults && showDropdown && (
        <ListGroup>
          {searchResults.map(teacher => (
            <ListGroup.Item
              key={teacher.user_id}
              action
              onClick={() => handleTeacherSelect(teacher)}
            >
              {teacher.username}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}

export default TeacherSearch;
