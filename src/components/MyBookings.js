import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Table, Spinner, ListGroup } from 'react-bootstrap';
import { createBooking, useBooking, useLoginStatus, updateBooking, useTeacherOccupiedSlots } from '../api';
import { formatBookingDateTime } from '../utils/dateUtils';
import TeacherSearch from './TeacherSearch';


const MyBookings = () => {
  const { user, isLoggedIn, isLoading: isLoginStatusLoading } = useLoginStatus();
  const requesterUserId = user ? user.user_id : null;

  const { bookings, error, isLoading: isBookingsLoading } = useBooking(null, null, requesterUserId); // Fetch bookings for the logged-in user as requester

  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null); // Store selected teacher object
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // Get teacherId from selectedTeacher
  const teacherId = selectedTeacher ? selectedTeacher.user_id : null;

  // Fetch teacher's occupied slots
  const { occupiedSlots, isLoading: isOccupiedSlotsLoading, isError: occupiedSlotsError } = useTeacherOccupiedSlots(teacherId);

  // States for editing/viewing existing bookings
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editSelectedTeacher, setEditSelectedTeacher] = useState(null); // State for selected teacher during edit
  const [editUpdateMessage, setEditUpdateMessage] = useState('');
  const [isEditUpdating, setIsEditUpdating] = useState(false);

  const handleCloseCreateModal = () => {
    setShowModal(false);
    setStartTime('');
    setEndTime('');
    setTitle('');
    setDescription('');
    setSelectedTeacher(null);
    setBookingError(null);
  };

  const handleShowCreateModal = () => {
    setBookingSuccess(false);
    setBookingError(null);
    setShowModal(true);
  };

  // Effect for real-time conflict checking
  useEffect(() => {
    // Clear previous error when inputs change
    setBookingError(null);

    // Only perform check if all necessary inputs are available and modal is open
    if (!showModal || !startTime || !endTime || !selectedTeacher || isOccupiedSlotsLoading || occupiedSlotsError) {
      return;
    }

    if (checkTimeConflict(startTime, endTime, occupiedSlots)) {
      setBookingError('The selected time slot is already occupied by the teacher. Please choose another time.');
      return;
    }

    // If no conflicts and all checks pass, clear any previous booking errors
    setBookingError(null);

  }, [startTime, endTime, selectedTeacher, occupiedSlots, isOccupiedSlotsLoading, occupiedSlotsError, showModal]);

  // Helper function to check for time conflicts
  const checkTimeConflict = (newStartTime, newEndTime, existingSlots) => {
    if (!newStartTime || !newEndTime || !existingSlots) return false;

    const newStart = new Date(newStartTime).getTime();
    const newEnd = new Date(newEndTime).getTime();

    // Invalid date parsing
    if (isNaN(newStart) || isNaN(newEnd)) return false;

    for (const slot of existingSlots) {
      const existingStart = new Date(slot.start_datetime).getTime();
      const existingEnd = new Date(slot.end_datetime).getTime();

      // Check for overlap
      // (StartA < EndB) and (EndA > StartB)
      if (newStart < existingEnd && newEnd > existingStart) {
        return true; // Conflict found
      }
    }
    return false; // No conflict
  };

 const handleShowEditModal = (booking) => {
    if (booking.status === 'pending' || booking.status === 'approved') {
      setSelectedBookingForEdit(booking);
      setEditTitle(booking.title);
      setEditDescription(booking.description || '');
      setEditStartTime(booking.start_time.substring(0, 16)); // Format for datetime-local input
      setEditEndTime(booking.end_time.substring(0, 16)); // Format for datetime-local input
	  setEditSelectedTeacher({ user_id: booking.teacher_id, username: booking.teacher_username });
      setEditUpdateMessage('');
      setShowEditModal(true);
    } else if (booking.status === 'denied') {
      setSelectedBookingForEdit(booking);
      setEditTitle(booking.title);
      setEditDescription(booking.description || '');
      setEditStartTime(booking.start_time.substring(0, 16)); // Format for datetime-local input
      setEditEndTime(booking.end_time.substring(0, 16)); // Format for datetime-local input
	  setEditSelectedTeacher({ user_id: booking.teacher_id, username: booking.teacher_username });
      setEditUpdateMessage('');
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBookingForEdit(null);
    setEditUpdateMessage('');
  };

  const handleResubmitBooking = async (e) => { // Renamed from handleUpdateBookingDetails
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    if (selectedBookingForEdit.status !== 'denied') {
      setEditUpdateMessage('Only denied bookings can be resubmitted.');
      return;
    }

    setIsEditUpdating(true);
    setEditUpdateMessage('');

    const updatedData = {
      title: editTitle,
      description: editDescription,
      start_time: editStartTime,
      end_time: editEndTime,
      status: 'pending', // Force status to pending on resubmit
    };

    const result = await updateBooking(selectedBookingForEdit.booking_id, updatedData, selectedBookingForEdit.status);

    if (result.success) {
      setEditUpdateMessage('Booking resubmitted successfully.');
      handleCloseEditModal(); // Close modal on success
    } else {
      setEditUpdateMessage(`Failed to resubmit booking: ${result.error}`);
    }
    setIsEditUpdating(false);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingForEdit) return;

    setIsEditUpdating(true);
    setEditUpdateMessage('');

    const result = await updateBooking(selectedBookingForEdit.booking_id, { status: 'denied' });

    if (result.success) {
      setEditUpdateMessage('Booking cancelled successfully.');
      handleCloseEditModal(); // Close modal on success
    } else {
      setEditUpdateMessage(`Failed to cancel booking: ${result.error}`);
    }
    setIsEditUpdating(false);
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!requesterUserId) { // Ensure requesterUserId is available
      setBookingError('User not logged in.');
      console.log('handleBooking: User not logged in, returning.');
      return;
    }

    if (!startTime || !endTime || !title || !selectedTeacher) {
      setBookingError('Please fill in all required fields (Start Time, End Time, Title, Teacher).');
      console.log('handleBooking: Missing required fields, returning.');
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    // Wait for occupied slots to load if they are still loading
    while (isOccupiedSlotsLoading) {
      setBookingError('Checking teacher availability, please wait...');
      console.log('handleBooking: Waiting for occupied slots to load...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait a short period
    }

    // Check for occupied slots after loading
    if (occupiedSlotsError) {
      setBookingError(`Error checking teacher availability: ${occupiedSlotsError.message}`);
      setIsBookingLoading(false);
      console.log('handleBooking: Occupied slots error, returning.');
      return;
    }

    console.log('Checking time conflict:');
    console.log('  New Start Time:', startTime);
    console.log('  New End Time:', endTime);
    console.log('  Occupied Slots:', occupiedSlots);

    try {
      const bookingData = {
        teacher_id: selectedTeacher.user_id, // Use teacherId from selectedTeacher
        requester_user_id: requesterUserId,
        start_time: startTime,
        end_time: endTime,
        title: title,
        description: description,
        status: 'pending',
      };

      const response = await createBooking(bookingData);

      if (response.success) {
        setBookingSuccess(true);
        handleCloseCreateModal();
      } else {
        setBookingError(response.error || 'Booking failed.');
      }
    } catch (err) {
      setBookingError('An error occurred during booking.');
      console.error('Error booking appointment:', err);
    } finally {
      setIsBookingLoading(false);
    }
  };

  if (isLoginStatusLoading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading user status...</span></Spinner>;
  }

  if (!isLoggedIn || !requesterUserId) {
    return <Alert variant="info">請先登入以查看及建立預約 (Please login first to view and create bookings)</Alert>;
  }

  if (isBookingsLoading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading Bookings...</span></Spinner>;
  }

  if (error) {
    return <Alert variant="danger">Error fetching bookings: {error.message || 'Unknown error'}</Alert>;
  }

  const approvedBookings = bookings ? bookings.filter(booking => booking.status === 'approved') : [];
  const deniedBookings = bookings ? bookings.filter(booking => booking.status === 'denied') : [];
  const pendingBookings = bookings ? bookings.filter(booking => booking.status === 'pending') : [];

  return (
    <div>
      <h2>預約功能 (Booking Functionality)</h2>

      {/* Button to open the booking modal */}
      <Button variant="primary" onClick={handleShowCreateModal}>
        建立預約 (Create Booking)
      </Button>

      {bookingSuccess && (
        <Alert variant="success" className="mt-3">Appointment booked successfully!</Alert>
      )}

      <h3 className="mt-4">已允許的預約 (Approved Bookings)</h3>
      {approvedBookings.length === 0 ? (
        <Alert variant="info">沒有已允許的預約 (No approved bookings).</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Teacher Name</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {approvedBookings.map(booking => (
              <tr key={booking.booking_id} className="table-success" onClick={() => handleShowEditModal(booking)} style={{ cursor: 'pointer' }}>
                <td>{booking.title}</td>
                <td>{booking.teacher_username}</td>
                <td>{formatBookingDateTime(booking.start_time, booking.end_time)}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h3 className="mt-4">已拒絕的預約 (Denied Bookings)</h3>
      {deniedBookings.length === 0 ? (
        <Alert variant="info">沒有已拒絕的預約 (No denied bookings).</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Teacher Name</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {deniedBookings.map(booking => (
              <tr key={booking.booking_id} className="table-danger" onClick={() => handleShowEditModal(booking)} style={{ cursor: 'pointer' }}>
                <td>{booking.title}</td>
                <td>{booking.teacher_username}</td>
                <td>{formatBookingDateTime(booking.start_time, booking.end_time)}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h3 className="mt-4">待處理預約 (Pending Bookings)</h3>
      {pendingBookings.length === 0 ? (
        <Alert variant="info">沒有待處理的預約 (No pending bookings).</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Teacher Name</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map(booking => (
              <tr key={booking.booking_id} className="table-warning">
                <td>{booking.title}</td>
                <td>{booking.teacher_username}</td>
                <td>{formatBookingDateTime(booking.start_time, booking.end_time)}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>建立預約 (Create Booking)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingError && <Alert variant="danger">{bookingError}</Alert>}
          {isOccupiedSlotsLoading && <Spinner animation="border" size="sm" className="me-2" />}
          {occupiedSlotsError && <Alert variant="danger">Error loading teacher availability: {occupiedSlotsError.message || 'Unknown error'}</Alert>}
          <Form onSubmit={handleBooking}>
            <Form.Group className="mb-3" controlId="teacherSearch">
              <Form.Label>Teacher</Form.Label>
              <TeacherSearch setSelectedTeacher={setSelectedTeacher} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Booking Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

             <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Booking Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="startTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" disabled={isBookingLoading}>
              {isBookingLoading ? 'Creating...' : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/View Booking Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>預約詳情 (Booking Details)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editUpdateMessage && <Alert variant={editUpdateMessage.includes('Failed') ? 'danger' : 'success'}>{editUpdateMessage}</Alert>}
          {isEditUpdating && <Spinner animation="border" size="sm" className="me-2" />}
          {selectedBookingForEdit ? (
                       <Form onSubmit={handleResubmitBooking}>
              <p><strong>老師:</strong> {editSelectedTeacher?.username}</p>
              <p><strong>Current Status:</strong> {selectedBookingForEdit.status}</p>
              <p><strong>Time:</strong> {formatBookingDateTime(selectedBookingForEdit.start_time, selectedBookingForEdit.end_time)}</p>

              <Form.Group className="mb-3" controlId="editTeacherSearch">
                <Form.Label>Teacher</Form.Label>
                <p>{editSelectedTeacher?.username}</p>
              </Form.Group>

              <Form.Group className="mb-3" controlId="editTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editDescription">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editStartTime">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editEndTime">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'}
                  required
                />
              </Form.Group>

              <Button type="submit" disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'} >
                {isEditUpdating ? '更新中...' : '更新'}
              </Button>
            </Form>
          ) : (
            <p>No booking selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedBookingForEdit && (
            <Button variant="danger" onClick={handleCancelBooking} disabled={isEditUpdating || selectedBookingForEdit.status === 'pending' || selectedBookingForEdit.status === 'approved'}>
              {isEditUpdating ? '取消中...' : '取消預約'}
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={isEditUpdating}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyBookings;
