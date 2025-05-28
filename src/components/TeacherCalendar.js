import React, { useState, useCallback, useEffect, useMemo } from 'react'; // Added useEffect, useMemo
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form, Container, Card, Alert, Spinner } from 'react-bootstrap'; // Added Spinner

// Import API functions
import { useCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../api';

const localizer = momentLocalizer(moment);

// Helper to format dates for the backend
const formatDateTimeForAPI = (date) => {
  return moment(date).format('YYYY-MM-DD HH:MM:SS');
};

function TeacherCalendar({ user }) { // Removed setActiveComponent if not used internally
  // State for calendar view range
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate(),
  });

  // Fetch events using the API hook
  const { 
    events: fetchedEvents, 
    isLoading: isLoadingEvents, 
    isError: fetchEventsError,
    revalidateEvents // To manually trigger re-fetch
  } = useCalendarEvents({ 
    userId: user ? user.user_id : null, 
    // Pass date range to fetch only events in the current view
    // Format them as YYYY-MM-DD for the API's start_date and end_date params
    startDate: moment(dateRange.start).format('YYYY-MM-DD'),
    endDate: moment(dateRange.end).format('YYYY-MM-DD'),
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    start: null,
    end: null,
    description: '',
    is_public: 0, // Default to private
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state during API calls

  // Transform fetched events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return fetchedEvents.map(event => ({
      ...event,
      id: event.event_id, // Map event_id to id
      start: new Date(event.start_datetime), // Convert string to Date object
      end: new Date(event.end_datetime),   // Convert string to Date object
    }));
  }, [fetchedEvents]);

  const handleRangeChange = useCallback((range) => {
    // range can be an array of dates (week/day view) or an object {start, end} (month view)
    if (Array.isArray(range)) {
      setDateRange({ start: moment(range[0]).toDate(), end: moment(range[range.length - 1]).endOf('day').toDate() });
    } else if (range.start && range.end) {
      // For month view, `range` is an object like { start: Date, end: Date }
      // The end date from react-big-calendar for month view is often the start of the last day shown.
      // Adjust to ensure we capture the whole range.
      setDateRange({ start: moment(range.start).toDate(), end: moment(range.end).endOf('day').toDate() });
    }
  }, []);


  const handleSelectSlot = useCallback(({ start, end }) => {
    setModalError('');
    setNewEventData({ title: '', start, end, description: '', is_public: 0 });
    setShowAddEventModal(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event); // event here is already transformed with Date objects and 'id'
    setShowEventModal(true);
  }, []);

  const handleNewEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEventData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
  };

  const handleSaveNewEvent = async () => {
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

    setIsSubmitting(true);
    const apiEventData = {
      title: newEventData.title,
      description: newEventData.description,
      start_datetime: formatDateTimeForAPI(newEventData.start),
      end_datetime: formatDateTimeForAPI(newEventData.end),
      is_public: newEventData.is_public,
      // user_id is handled by the backend based on session
    };

    try {
      const result = await createCalendarEvent(apiEventData);
      if (result.success) {
        setShowAddEventModal(false);
        setNewEventData({ title: '', start: null, end: null, description: '', is_public: 0 });
        // SWR should revalidate useCalendarEvents automatically due to changes in /api/calendar.php
        // Or we could call revalidateEvents() if needed, but performMutation should handle it.
      } else {
        // API returns 409 with { "message": "...", "data": { "conflicting_event_id": ... } }
        if (result.error && result.error.toLowerCase().includes('conflict')) {
            setModalError(`Time conflict detected. ${result.message || ''}`);
        } else {
            setModalError(result.error || 'Failed to save event.');
        }
      }
    } catch (err) {
      setModalError('An unexpected error occurred: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    setIsSubmitting(true);
    try {
      const result = await deleteCalendarEvent(selectedEvent.id); // Use original event_id if mapped, or ensure 'id' is the correct one
      if (result.success) {
        setShowEventModal(false);
        setSelectedEvent(null);
        // SWR should revalidate
      } else {
        alert('Error deleting event: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('An unexpected error occurred: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid>
      <Card className="mt-3">
        <Card.Header as="h4">Teacher Calendar</Card.Header>
        <Card.Body>
          {fetchEventsError && <Alert variant="danger">Error loading events. Please try again later.</Alert>}
          <p>Select a slot to add an event, or click an existing event to view/delete.</p>
          <div style={{ height: '70vh' }}>
            {isLoadingEvents && <Spinner animation="border" />}
            {!isLoadingEvents && (
              <Calendar
                localizer={localizer}
                events={calendarEvents} // Use transformed events
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onRangeChange={handleRangeChange} // Fetch new events when range changes
                defaultView="month"
                views={['month', 'week', 'day', 'agenda']}
                date={dateRange.start} // Control current date view
              />
            )}
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
              <p><strong>Public:</strong> {selectedEvent.is_public ? 'Yes' : 'No'}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={handleDeleteEvent} disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Delete Event'}
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
              <Form.Control type="text" name="title" value={newEventData.title} onChange={handleNewEventChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventStart">
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="text" readOnly value={newEventData.start ? moment(newEventData.start).format('LLL') : ''} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventEnd">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="text" readOnly value={newEventData.end ? moment(newEventData.end).format('LLL') : ''} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventDescription">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={newEventData.description} onChange={handleNewEventChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventIsPublic">
              <Form.Check type="checkbox" name="is_public" label="Make this event public" checked={newEventData.is_public === 1} onChange={handleNewEventChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveNewEvent} disabled={isSubmitting}>
            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : 'Save Schedule'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TeacherCalendar;
