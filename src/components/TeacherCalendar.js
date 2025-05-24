import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form, Container, Card, Alert } from 'react-bootstrap';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

function TeacherCalendar({ user, setActiveComponent }) { // user might be needed later for API calls
  const [events, setEvents] = useState([
    // Sample initial event (optional)
    // {
    //   id: 1,
    //   title: 'Sample Meeting',
    //   start: new Date(moment().startOf('day').add(10, 'hours').valueOf()), // Today 10 AM
    //   end: new Date(moment().startOf('day').add(12, 'hours').valueOf()),   // Today 12 PM
    //   description: 'Discuss project updates',
    // }
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    start: null,
    end: null,
    description: '',
  });
  const [modalError, setModalError] = useState('');


  // --- Start of Event Handling Callbacks ---
  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      setModalError('');
      setNewEventData({ title: '', start, end, description: '' });
      setShowAddEventModal(true);
    },
    []
  );

  const handleSelectEvent = useCallback(
    (event) => {
      setSelectedEvent(event);
      setShowEventModal(true);
    },
    []
  );
  // --- End of Event Handling Callbacks ---


  // --- Start of Modal Form Handling ---
  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEventData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewEventDateTimeChange = (name, datetime) => {
    // For potential future use with datetime pickers; for now, start/end are from slot
    setNewEventData(prev => ({ ...prev, [name]: new Date(datetime) }));
  };


  const handleSaveNewEvent = () => {
    setModalError('');
    if (!newEventData.title) {
      setModalError('Title is required.');
      return;
    }
    if (!newEventData.start || !newEventData.end) {
        setModalError('Start and End times are required.');
        return;
    }
    if (moment(newEventData.start).isAfter(moment(newEventData.end))) {
        setModalError('Start time cannot be after end time.');
        return;
    }

    // Placeholder for API call
    console.log('Simulating API call to add event:', newEventData);
    // const result = await addEventApiCall(newEventData); // Actual API call
    // if (result.success) {
      setEvents(prev => [
        ...prev,
        { ...newEventData, id: Date.now() /* Temporary ID */ }
      ]);
      setShowAddEventModal(false);
      setNewEventData({ title: '', start: null, end: null, description: '' });
    // } else {
    //   setModalError(result.error || 'Failed to save event.');
    // }
  };
  
  const handleDeleteEvent = () => {
    if (!selectedEvent || !selectedEvent.id) return;

    // Placeholder for API call
    console.log('Simulating API call to delete event:', selectedEvent.id);
    // const result = await deleteEventApiCall(selectedEvent.id); // Actual API call
    // if (result.success) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setShowEventModal(false);
      setSelectedEvent(null);
    // } else {
    //   alert('Error deleting event: ' + result.error); // Or set error in modal
    // }
  };
  // --- End of Modal Form Handling ---


  return (
    <Container fluid>
      <Card className="mt-3">
        <Card.Header as="h4">Teacher Calendar</Card.Header>
        <Card.Body>
          <p>Select a slot to add an event, or click an existing event to view/delete.</p>
          <div style={{ height: '70vh' }}> {/* Calendar needs a defined height */}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable // Allows clicking on empty slots
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              defaultView="month"
              views={['month', 'week', 'day', 'agenda']}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Modal for Viewing/Deleting Existing Event */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <p><strong>Starts:</strong> {moment(selectedEvent.start).format('LLL')}</p>
              <p><strong>Ends:</strong> {moment(selectedEvent.end).format('LLL')}</p>
              {selectedEvent.description && <p><strong>Description:</strong> {selectedEvent.description}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={handleDeleteEvent}>
            Delete Event
          </Button>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Adding New Event */}
      <Modal show={showAddEventModal} onHide={() => setShowAddEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="eventTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={newEventData.title} 
                onChange={handleNewEventChange} 
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventStart">
              <Form.Label>Start Time</Form.Label>
              {/* In a real app, use a DateTimePicker here. For now, it's pre-filled by onSelectSlot */}
              <Form.Control 
                type="text" 
                readOnly 
                value={newEventData.start ? moment(newEventData.start).format('LLL') : ''} 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventEnd">
              <Form.Label>End Time</Form.Label>
              <Form.Control 
                type="text" 
                readOnly 
                value={newEventData.end ? moment(newEventData.end).format('LLL') : ''} 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventDescription">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={newEventData.description} 
                onChange={handleNewEventChange} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewEvent}>
            Save Schedule
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TeacherCalendar;
