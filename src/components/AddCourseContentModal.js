import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { getMyArticles, getMyFiles } from '../api'; // Assuming these API functions exist

const AddCourseContentModal = ({ show, handleClose, courseId, onAddContent, user }) => {
  const [contentType, setContentType] = useState('article'); // 'article' or 'file'
  const [selectedItem, setSelectedItem] = useState('');
  const [items, setItems] = useState([]); // Holds articles or files
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset state when modal is shown
      setSelectedItem('');
      setError(null);
      setSubmitting(false); // Reset submitting state when modal is opened
      setContentType('article'); // Default to article
    }
  }, [show]);

  useEffect(() => {
    if (show && user && user.id) {
      const fetchItems = async () => {
        setLoadingItems(true);
        setError(null);
        setItems([]); // Clear previous items before fetching new ones
        try {
          let fetchedItems = [];
          if (contentType === 'article') {
            fetchedItems = await getMyArticles(user.id);
          } else {
            fetchedItems = await getMyFiles(user.id);
          }
          setItems(fetchedItems || []); // Ensure items is always an array
        } catch (err) {
          console.error(`Error fetching ${contentType}s:`, err);
          setError(`Failed to load your ${contentType}s. ${err.message}`);
          setItems([]); // Clear items on error
        }
        setLoadingItems(false);
      };
      fetchItems();
    } else if (show && (!user || !user.id)) {
        setError("User information is not available. Cannot load items.");
        setItems([]);
        setLoadingItems(false);
    }
  }, [show, contentType, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      setError('Please select an item to add.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const contentData = {
      course_id: courseId,
    };
    if (contentType === 'article') {
      contentData.article_id = parseInt(selectedItem);
    } else {
      contentData.file_id = parseInt(selectedItem);
    }

    try {
        await onAddContent(contentData);
        // Parent (CourseContent) is responsible for closing modal on success via handleAddContent -> setShowAddModal(false)
        // and also for resetting submitting state if needed, or this component can do it if it's still mounted.
        // If onAddContent was successful, it should've hidden the modal.
        // If modal is still shown, it means there was an issue handled by parent, or parent didn't hide.
        // For robustness, ensure submitting is false if we're still here.
        // However, onAddContent in CourseContent.js already calls setShowAddModal(false) and setLoading(false) which implies submitting should be handled there.
        // Let's assume parent handles closing and thus unmounting/hiding this modal.
    } catch (apiError) {
        // This catch block in modal might not be strictly necessary if onAddContent in parent handles its own errors.
        // However, it can be a fallback.
        console.error('Error during onAddContent call from modal context:', apiError);
        setError(`Failed to add content: ${apiError.message}`);
        setSubmitting(false); // Explicitly stop submitting animation on error within the modal
    }
  };

  const handleActualClose = () => {
    if (!submitting) {
        handleClose(); // Call the original handleClose from props
    }
    // If submitting, the modal close is typically blocked or handled by the submission logic itself.
  };


  return (
    <Modal show={show} onHide={handleActualClose} backdrop={submitting ? 'static' : true} keyboard={!submitting}>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Add New Content to Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Content Type:</Form.Label>
            <div>
              <ToggleButtonGroup
                type="radio"
                name={`contentType-${courseId}`}
                value={contentType}
                onChange={(val) => { if(!submitting && !loadingItems) { setContentType(val); setSelectedItem(''); } }}
                className="mb-2"
              >
                <ToggleButton id={`tbg-radio-article-${courseId}`} value={'article'} variant="outline-primary" disabled={submitting || loadingItems}>
                  Article
                </ToggleButton>
                <ToggleButton id={`tbg-radio-file-${courseId}`} value={'file'} variant="outline-primary" disabled={submitting || loadingItems}>
                  File
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Form.Group>

          {loadingItems ? (
            <div className="text-center my-3">
              <Spinner animation="border" size="sm" /> Loading your {contentType}s...
            </div>
          ) : items.length > 0 ? (
            <Form.Group className="mb-3">
              <Form.Label>Select {contentType === 'article' ? 'Article' : 'File'}:</Form.Label>
              <Form.Select
                aria-label={`Select ${contentType}`}
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">-- Select an item --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {contentType === 'article' ? item.title : item.name} (ID: {item.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : (
            <Alert variant="info">
              You don't have any {contentType}s to add, or they could not be loaded.
              {contentType === 'article' ? 'Try creating some articles first via the Articles page.' : 'Try uploading some files first (feature might be elsewhere).'}
            </Alert>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleActualClose} disabled={submitting} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loadingItems || items.length === 0 || !selectedItem || submitting}>
              {submitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...</> : 'Add to Course'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddCourseContentModal;
