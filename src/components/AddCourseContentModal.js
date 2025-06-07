import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { useArticle, useFile } from '../api';

const AddCourseContentModal = ({ show, handleClose, courseId, onAddContent, user }) => {
  const [contentType, setContentType] = useState('article'); // 'article' or 'file'
  const [selectedItem, setSelectedItem] = useState('');
  const [currentError, setCurrentError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // SWR Hooks
  const fetchArticlesCondition = show && user && user.user_id && contentType === 'article';
  const fetchFilesCondition = show && user && user.user_id && contentType === 'file';

  console.log('AddCourseContentModal - SWR Hook Params:', {
      userIdForArticle: fetchArticlesCondition ? user.user_id : null,
      userIdForFile: fetchFilesCondition ? user.user_id : null,
      fetchArticlesCondition,
      fetchFilesCondition
  });

  const { articles, isLoading: loadingArticles, isError: errorArticles } = useArticle(
    null, // articleId (not fetching a specific one)
    fetchArticlesCondition ? user.user_id : null // teacherId
  );

  console.log('AddCourseContentModal - useArticle SWR:', { articles, loadingArticles, errorArticles });

  const { files, isLoading: loadingFiles, isError: errorFiles } = useFile(
    null, // fileId (not fetching a specific one)
    fetchFilesCondition ? user.user_id : null // uploaderId
  );

  console.log('AddCourseContentModal - useFile SWR:', { files, loadingFiles, errorFiles });

  useEffect(() => {
    if (show) {
        setSelectedItem('');
        setCurrentError(null);
        setSubmitting(false);
        // Consider resetting contentType to 'article' here if it should always default on open
        // For now, it retains selection unless modal is fully closed and reopened.
    } else {
         setContentType('article'); // Reset to default when closing/hidden
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    console.log('AddCourseContentModal - User for error check:', user);
    if (!user || !user.user_id) {
      setCurrentError("User information is not available. Cannot load items.");
      return;
    }
    // Prioritize SWR hook errors
    if (contentType === 'article' && errorArticles) {
      setCurrentError(`Failed to load your articles: ${errorArticles.message || 'Unknown error'}`);
    } else if (contentType === 'file' && errorFiles) {
      setCurrentError(`Failed to load your files: ${errorFiles.message || 'Unknown error'}`);
    } else {
       // Clear error only if no SWR error is active for the current type
      if (!((contentType === 'article' && errorArticles) || (contentType === 'file' && errorFiles))) {
          setCurrentError(null);
      }
    }
  }, [contentType, errorArticles, errorFiles, user, show]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      setCurrentError('Please select an item to add.');
      return;
    }
    setSubmitting(true);
    setCurrentError(null);

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
    } catch (apiError) {
        console.error('Error during onAddContent call from modal context:', apiError);
        setCurrentError(`Failed to add content: ${apiError.message}`);
        setSubmitting(false);
    }
  };

  const handleActualClose = () => {
    if (!submitting) {
        handleClose();
    }
  };

  const currentItems = contentType === 'article' ? articles : files;
  const isLoadingCurrentItems = contentType === 'article' ? loadingArticles : loadingFiles;

  return (
    <Modal show={show} onHide={handleActualClose} backdrop={submitting ? 'static' : true} keyboard={!submitting}>
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Add New Content to Course</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentError && <Alert variant="danger" onClose={() => setCurrentError(null)} dismissible>{currentError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Content Type:</Form.Label>
            <div>
              <ToggleButtonGroup
                type="radio"
                name={`contentType-modal-${courseId}`} // Ensure unique name for radio group
                value={contentType}
                onChange={(val) => {
                    if (!submitting && !(val === 'article' && loadingArticles) && !(val === 'file' && loadingFiles)) {
                        setContentType(val);
                        setSelectedItem('');
                        setCurrentError(null); // Clear error on type change
                    }
                }}
                className="mb-2"
              >
                <ToggleButton
                  id={`tbg-modal-radio-article-${courseId}`}
                  value={'article'}
                  variant="outline-primary"
                  disabled={submitting || loadingArticles}
                >
                  Article
                </ToggleButton>
                <ToggleButton
                  id={`tbg-modal-radio-file-${courseId}`}
                  value={'file'}
                  variant="outline-primary"
                  disabled={submitting || loadingFiles}
                >
                  File
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Form.Group>

          {isLoadingCurrentItems ? (
            <div className="text-center my-3">
              <Spinner animation="border" size="sm" /> Loading your {contentType}s...
            </div>
          ) : currentItems && currentItems.length > 0 ? (
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
                {currentItems.map((item) => {
                    const id = item.article_id || item.file_id || item.id;
                    const name = contentType === 'article' ? item.title : item.name;
                    return (
                        <option key={id} value={id}>
                            {name} (ID: {id})
                        </option>
                    );
                })}
              </Form.Select>
            </Form.Group>
          ) : (
             !currentError && show && ( // Only show "no items" if not loading and no error
                <Alert variant="info">
                You don't have any {contentType}s to add, or they could not be loaded.
                {contentType === 'article' ? 'Try creating some articles first via the Articles page.' : 'Try uploading some files first.'}
                </Alert>
             )
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleActualClose} disabled={submitting} className="me-2">
              Cancel
            </Button>
            <Button
                variant="primary"
                type="submit"
                disabled={isLoadingCurrentItems || !currentItems || currentItems.length === 0 || !selectedItem || submitting}
            >
              {submitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding...</> : 'Add to Course'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddCourseContentModal;
