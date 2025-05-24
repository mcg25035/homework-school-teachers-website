import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Table, Spinner } from 'react-bootstrap'; // Import Table, Spinner
import { createBooking, useBooking, useLoginStatus, updateBooking } from '../api'; // Import updateBooking
import { formatBookingDateTime } from '../utils/dateUtils'; // Import formatBookingDateTime


const MyBookings = () => {
  const { user, isLoggedIn, isLoading: isLoginStatusLoading } = useLoginStatus();
  const requesterUserId = user ? user.user_id : null;

  const { bookings, error, isLoading: isBookingsLoading } = useBooking(null, null, requesterUserId); // Fetch bookings for the logged-in user as requester

  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // States for editing/viewing existing bookings
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTeacherId, setEditTeacherId] = useState(''); // State for editing teacher ID
  const [editUpdateMessage, setEditUpdateMessage] = useState('');
  const [isEditUpdating, setIsEditUpdating] = useState(false);

  const handleCloseCreateModal = () => { // Renamed for clarity
    setShowModal(false);
    setStartTime('');
    setEndTime('');
    setTitle('');
    setDescription('');
    setTeacherId('');
    setBookingError(null);
  };
  const handleShowCreateModal = () => { // Renamed for clarity
    setBookingSuccess(false);
    setBookingError(null);
    setShowModal(true);
  };

  const handleShowEditModal = (booking) => {
    setSelectedBookingForEdit(booking);
    setEditTitle(booking.title);
    setEditDescription(booking.description || '');
    setEditStartTime(booking.start_time.substring(0, 16)); // Format for datetime-local input
    setEditEndTime(booking.end_time.substring(0, 16)); // Format for datetime-local input
    setEditTeacherId(booking.teacher_id); // Initialize teacher ID for editing
    setEditUpdateMessage('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBookingForEdit(null);
    setEditUpdateMessage('');
  };

  const handleResubmitBooking = async (e) => { // Renamed from handleUpdateBookingDetails
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    setIsEditUpdating(true);
    setEditUpdateMessage('');

    const updatedData = {
      teacher_id: parseInt(editTeacherId, 10), // Allow changing teacher
      title: editTitle,
      description: editDescription,
      start_time: editStartTime,
      end_time: editEndTime,
      status: 'pending', // Force status to pending on resubmit
    };

    const result = await updateBooking(selectedBookingForEdit.booking_id, updatedData);

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
      return;
    }

    if (!startTime || !endTime || !title || !teacherId) {
      setBookingError('Please fill in all required fields (Start Time, End Time, Title, Teacher ID).');
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const bookingData = {
        teacher_id: parseInt(teacherId, 10),
        requester_user_id: requesterUserId, // Use actual logged-in user's ID
        start_time: startTime,
        end_time: endTime,
        title: title,
        description: description,
        status: 'pending',
      };

      const response = await createBooking(bookingData);

      if (response.success) {
        setBookingSuccess(true);
        setStartTime('');
        setEndTime('');
        setTitle('');
        setDescription('');
        setTeacherId('');
        // No need to manually mutate here, performMutation handles it
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
                <td>{booking.teacher_name}</td>
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
                <td>{booking.teacher_name}</td>
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
              <tr key={booking.booking_id} className="table-warning" onClick={() => handleShowEditModal(booking)} style={{ cursor: 'pointer' }}>
                <td>{booking.title}</td>
                <td>{booking.teacher_name}</td>
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
          <Form onSubmit={handleBooking}>
             <Form.Group className="mb-3" controlId="teacherId">
              <Form.Label>Teacher ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              />
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

            <Button type="submit" style={{ display: 'none' }} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleBooking} disabled={isBookingLoading}>
            {isBookingLoading ? '建立中...' : '確認建立'}
          </Button>
          <Button variant="secondary" onClick={handleCloseCreateModal} disabled={isBookingLoading}>
            關閉
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
              <p><strong>Teacher:</strong> {selectedBookingForEdit.teacher_name}</p>
              <p><strong>Current Status:</strong> {selectedBookingForEdit.status}</p>
              <p><strong>Time:</strong> {formatBookingDateTime(selectedBookingForEdit.start_time, selectedBookingForEdit.end_time)}</p>

              <Form.Group className="mb-3" controlId="editTeacherId">
                <Form.Label>Teacher ID</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Teacher ID"
                  value={editTeacherId}
                  onChange={(e) => setEditTeacherId(e.target.value)}
                  disabled={selectedBookingForEdit.status === 'denied' || isEditUpdating} // Disable if denied or updating
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isEditUpdating}
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
                  disabled={isEditUpdating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editStartTime">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  disabled={isEditUpdating}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editEndTime">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  disabled={isEditUpdating}
                  required
                />
              </Form.Group>

              <Button type="submit" style={{ display: 'none' }} /> {/* Hidden submit button */}
            </Form>
          ) : (
            <p>No booking selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedBookingForEdit && ( // Resubmit button always available for requester
            <Button variant="primary" onClick={handleResubmitBooking} disabled={isEditUpdating}>
              {isEditUpdating ? '重新送出中...' : '重新送出 (Resubmit)'}
            </Button>
          )}
          {selectedBookingForEdit && (
            <Button variant="danger" onClick={handleCancelBooking} disabled={isEditUpdating}>
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
