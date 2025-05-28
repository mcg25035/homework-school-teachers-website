import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Form, Container, Card, Alert, Spinner } from 'react-bootstrap';

// Import API functions
import { useCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '../api';

const localizer = momentLocalizer(moment);

// Helper to format dates for the backend
const formatDateTimeForAPI = (date) => {
  return moment(date).format('YYYY-MM-DD HH:MM:SS');
};

function TeacherCalendar({ user }) {
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [apiFetchRange, setApiFetchRange] = useState({
    start: moment(currentCalendarDate).startOf('month').format('YYYY-MM-DD'),
    end: moment(currentCalendarDate).endOf('month').format('YYYY-MM-DD'),
  });

  const { 
    events: fetchedEvents, 
    isLoading: isLoadingEvents, 
    isError: fetchEventsError,
    // revalidateEvents // Not explicitly used, SWR handles revalidation via performMutation
  } = useCalendarEvents({ 
    userId: user ? user.user_id : null, 
    startDate: apiFetchRange.start,
    endDate: apiFetchRange.end,
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    start: null,
    end: null,
    description: '',
    is_public: 0,
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calendarEvents = useMemo(() => {
    return fetchedEvents.map(event => ({
      ...event, 
      start: new Date(event.start_datetime),
      end: new Date(event.end_datetime),   
    }));
  }, [fetchedEvents]);

  const handleNavigate = useCallback((newDate) => {
    setCurrentCalendarDate(new Date(newDate));
  }, []);

  const handleRangeChange = useCallback((rangeInput, view) => {
    let startMoment, endMoment;
    if (Array.isArray(rangeInput)) { 
      startMoment = moment(rangeInput[0]);
      endMoment = moment(rangeInput[rangeInput.length - 1]);
    } else { 
      startMoment = moment(rangeInput.start);
      endMoment = moment(rangeInput.end);
    }
    let effectiveView = view || 'month';
    setApiFetchRange({
      start: startMoment.startOf(effectiveView === 'agenda' ? 'day' : effectiveView).format('YYYY-MM-DD'),
      end: endMoment.endOf(effectiveView === 'agenda' ? 'day' : effectiveView).format('YYYY-MM-DD'),
    });
  }, []);

  useEffect(() => {
    setApiFetchRange({
        start: moment(currentCalendarDate).startOf('month').format('YYYY-MM-DD'),
        end: moment(currentCalendarDate).endOf('month').format('YYYY-MM-DD'),
    });
  }, [currentCalendarDate]);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setModalError('');
    setNewEventData({ title: '', start, end, description: '', is_public: 0 });
    setShowAddEventModal(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setModalError(''); 
    setSelectedEvent(event); 
    setShowEventModal(true);
  }, []);

  const handleNewEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNewEventData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else if (type === 'datetime-local') {
      setNewEventData(prev => ({ ...prev, [name]: value ? moment(value).toDate() : null }));
    } else {
      setNewEventData(prev => ({ ...prev, [name]: value }));
    }
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
    };

    try {
      const result = await createCalendarEvent(apiEventData);
      if (result.success) {
        setShowAddEventModal(false);
        setNewEventData({ title: '', start: null, end: null, description: '', is_public: 0 });
      } else {
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
    const eventIdToDelete = selectedEvent ? selectedEvent.id : null; 
    if (!selectedEvent || typeof eventIdToDelete === 'undefined' || eventIdToDelete === null) {
      console.error('No valid event ID (selectedEvent.id) found for deletion. selectedEvent:', selectedEvent);
      setModalError('Cannot delete event: Critical Event ID is missing.');
      return;
    }
    console.log(`Attempting to delete event with ID: ${eventIdToDelete}. Full event object:`, selectedEvent); 
    setModalError(''); 

    setIsSubmitting(true);
    try {
      const result = await deleteCalendarEvent(eventIdToDelete);
      if (result.success) {
        setShowEventModal(false);
        setSelectedEvent(null);
      } else {
        setModalError(result.error || 'Error deleting event. Please try again.');
      }
    } catch (err) {
      setModalError('An unexpected error occurred: ' + err.message);
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
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate} 
                onRangeChange={handleRangeChange} 
                date={currentCalendarDate} 
                defaultView="month" // Kept as is per instruction for this step
                views={['month']}    // Kept as is per instruction for this step
              />
            )}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showEventModal} onHide={() => { setShowEventModal(false); setModalError(''); }}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger" onClose={() => setModalError('')} dismissible>{modalError}</Alert>}
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

      <Modal show={showAddEventModal} onHide={() => {setShowAddEventModal(false); setModalError(''); /*Clear error on close*/ }}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger" onClose={() => setModalError('')} dismissible>{modalError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="eventTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={newEventData.title} onChange={handleNewEventChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventStart">
              <Form.Label>Start Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="start"
                value={newEventData.start ? moment(newEventData.start).format('YYYY-MM-DDTHH:mm') : ''} 
                onChange={handleNewEventChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="eventEnd">
              <Form.Label>End Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="end"
                value={newEventData.end ? moment(newEventData.end).format('YYYY-MM-DDTHH:mm') : ''} 
                onChange={handleNewEventChange} 
                required 
              />
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
          <Button variant="secondary" onClick={() => {setShowAddEventModal(false); setModalError('');}}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveNewEvent} disabled={isSubmitting}>
            {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : 'Save Schedule'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TeacherCalendar;
