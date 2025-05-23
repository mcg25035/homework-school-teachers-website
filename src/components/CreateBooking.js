import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createBooking } from '../api'; // Import createBooking from api.js

const CreateBooking = () => {
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState(''); // State for teacher ID input
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    // Optionally reset form fields and messages when closing
    setStartTime('');
    setEndTime('');
    setTitle('');
    setDescription('');
    setTeacherId('');
    setBookingError(null);
    // Keep success message visible until modal is reopened or page refreshed
  };
  const handleShow = () => {
    setBookingSuccess(false); // Reset success message when opening
    setBookingError(null); // Reset error message when opening
    setShowModal(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!startTime || !endTime || !title || !teacherId) {
      setBookingError('Please fill in all required fields (Start Time, End Time, Title, Teacher ID).');
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const bookingData = {
        teacher_id: parseInt(teacherId, 10), // Convert teacherId to integer
        requester_user_id: 1, // Placeholder (should be logged-in user's ID)
        start_time: startTime,
        end_time: endTime,
        title: title,
        description: description, // Include description
        status: 'pending', // Placeholder status
        // Other optional fields like requester_name, requester_email, is_public_on_calendar
      };

      const response = await createBooking(bookingData); // Use the createBooking function

      if (response.success) {
        setBookingSuccess(true);
        setStartTime(''); // Clear input fields after booking
        setEndTime('');
        setTitle('');
        setDescription('');
        setTeacherId('');
        // Optionally close modal on success
        // handleClose();
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

  return (
    <div>
      <h2>預約功能 (Booking Functionality)</h2>

      {/* Button to open the booking modal */}
      <Button variant="primary" onClick={handleShow}>
        建立預約 (Create Booking)
      </Button>

      {bookingSuccess && (
        <Alert variant="success" className="mt-3">Appointment booked successfully!</Alert>
      )}

      {/* Available time slots section is left empty as requested */}
      <h3 className="mt-4">Available Time Slots:</h3>
      <p>Available slots will be displayed here in the future.</p>


      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>建立預約 (Create Booking)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingError && <Alert variant="danger">{bookingError}</Alert>}
          <Form onSubmit={handleBooking}>
             <Form.Group className="mb-3" controlId="teacherId">
              <Form.Label>Teacher ID</Form.Label>
              <Form.Control
                type="number" // Use number type for ID
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
                as="textarea" // Use textarea for description
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

            {/* Hidden submit button inside the form */}
            <Button type="submit" style={{ display: 'none' }} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {/* Button in footer that triggers the form submission */}
          <Button variant="primary" onClick={handleBooking} disabled={isBookingLoading}>
            {isBookingLoading ? '建立中...' : '確認建立'}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={isBookingLoading}>
            關閉
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateBooking;
