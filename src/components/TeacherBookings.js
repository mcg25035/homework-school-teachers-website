import React, { useState } from 'react';
import useSWR from 'swr';
import { useBooking, useLoginStatus, updateBooking } from '../api'; // Import updateBooking
import { Table, Alert, Spinner, Modal, Button, Form } from 'react-bootstrap'; // Import Form
import { formatBookingDateTime } from '../utils/dateUtils';

const TeacherBookings = () => {
  const { user, isLoggedIn, isLoading: isLoginStatusLoading } = useLoginStatus();
  const teacherId = user ? user.user_id : null;

  const { bookings, error, isLoading } = useBooking(null, teacherId); 

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isPublicOnCalendar, setIsPublicOnCalendar] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // State for loading during update
  const [updateMessage, setUpdateMessage] = useState(''); // State for update messages

  const handleShowActionModal = (booking) => {
    setSelectedBooking(booking);
    setIsPublicOnCalendar(booking.is_public_on_calendar === 1); // Initialize checkbox state
    setUpdateMessage(''); // Clear previous messages
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedBooking(null);
    setUpdateMessage('');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedBooking) return;

    setIsUpdating(true);
    setUpdateMessage('');

    const result = await updateBooking(selectedBooking.booking_id, { status: newStatus });

    if (result.success) {
      setUpdateMessage(`Booking status updated to ${newStatus} successfully.`);
      handleCloseActionModal(); // Close modal on success
    } else {
      setUpdateMessage(`Failed to update booking status: ${result.error}`);
    }
    setIsUpdating(false);
  };

  const handleTogglePublicOnCalendar = async () => {
    if (!selectedBooking) return;

    setIsUpdating(true);
    setUpdateMessage('');

    const newIsPublic = isPublicOnCalendar ? 0 : 1; // Toggle value
    const result = await updateBooking(selectedBooking.booking_id, { is_public_on_calendar: newIsPublic });

    if (result.success) {
      setIsPublicOnCalendar(newIsPublic === 1); // Update local state
      setUpdateMessage('Public on calendar status updated successfully.');
    } else {
      setUpdateMessage(`Failed to update public on calendar status: ${result.error}`);
    }
    setIsUpdating(false);
  };

  if (isLoginStatusLoading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading user status...</span></Spinner>;
  }

  if (!isLoggedIn || !teacherId) {
    return <Alert variant="info">請先登入以查看教師預約 (Please login first to view teacher bookings)</Alert>;
  }

  if (isLoading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading Bookings...</span></Spinner>;
  }

  if (error) {
    return <Alert variant="danger">Error fetching bookings: {error.message || 'Unknown error'}</Alert>;
  }

  // Filter bookings into pending and approved lists, excluding denied
  const pendingBookings = bookings ? bookings.filter(booking => booking.status === 'pending') : [];
  const approvedBookings = bookings ? bookings.filter(booking => booking.status === 'approved') : [];

  return (
    <div>
      <h2>教師預約列表 (Teacher Bookings)</h2>

      <h3 className="mt-4">待處理預約 (Pending Bookings)</h3>
      {pendingBookings.length === 0 ? (
        <Alert variant="info">沒有待處理的預約 (No pending bookings).</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Requester Name</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map(booking => (
              <tr key={booking.booking_id} className="table-warning" onClick={() => handleShowActionModal(booking)} style={{ cursor: 'pointer' }}> {/* Make row clickable */}
                <td>{booking.title}</td>
                <td>{booking.requester_name}</td>
                <td>{formatBookingDateTime(booking.start_time, booking.end_time)}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h3 className="mt-4">已同意預約 (Approved Bookings)</h3>
      {approvedBookings.length === 0 ? (
        <Alert variant="info">沒有已同意的預約 (No approved bookings).</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Requester Name</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {approvedBookings.map(booking => (
              <tr key={booking.booking_id} className="table-success" onClick={() => handleShowActionModal(booking)} style={{ cursor: 'pointer' }}>
                <td>{booking.title}</td>
                <td>{booking.requester_name}</td>
                <td>{formatBookingDateTime(booking.start_time, booking.end_time)}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Action Modal for Bookings */}
      <Modal show={showActionModal} onHide={handleCloseActionModal}>
        <Modal.Header closeButton>
          <Modal.Title>處理預約 (Handle Booking)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateMessage && <Alert variant={updateMessage.includes('Failed') ? 'danger' : 'success'}>{updateMessage}</Alert>}
          {isUpdating && <Spinner animation="border" size="sm" className="me-2" />}
          {selectedBooking ? (
            <div>
              <p><strong>Title:</strong> {selectedBooking.title}</p>
              <p><strong>Requester:</strong> {selectedBooking.requester_name}</p>
              <p><strong>Time:</strong> {formatBookingDateTime(selectedBooking.start_time, selectedBooking.end_time)}</p>
              {selectedBooking.description && <p><strong>Description:</strong> {selectedBooking.description}</p>}
              <p><strong>Current Status:</strong> {selectedBooking.status}</p>

              {(selectedBooking.status === 'pending' || selectedBooking.status === 'approved') && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="公開在日曆上 (Public on Calendar)"
                      checked={isPublicOnCalendar}
                      onChange={handleTogglePublicOnCalendar}
                      disabled={isUpdating}
                    />
                  </Form.Group>
                </>
              )}
            </div>
          ) : (
            <p>No booking selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedBooking && selectedBooking.status === 'pending' && (
            <>
              <Button variant="success" onClick={() => handleUpdateStatus('approved')} disabled={isUpdating}>
                同意 (Approve)
              </Button>
              <Button variant="danger" onClick={() => handleUpdateStatus('denied')} disabled={isUpdating}>
                拒絕 (Deny)
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseActionModal} disabled={isUpdating}>
            關閉 (Close)
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherBookings;