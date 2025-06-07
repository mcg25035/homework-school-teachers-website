import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import AddCourseContentModal from './AddCourseContentModal';
import { getCourseContent, deleteCourseContent, addCourseContent, downloadFile } from '../api'; // Import API functions
import ArticleView from './ArticleView'; // Import ArticleView
import FileListAndDownload from './FileListAndDownload'; // Import FileListAndDownload

const CourseContent = ({ course_id, user }) => { // Changed courseId to course_id
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true); // Fixed syntax error: added useState
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [courseName, setCourseName] = useState('Course Name');
  const [selectedArticleId, setSelectedArticleId] = useState(null); // State for selected article
  const [selectedFileId, setSelectedFileId] = useState(null); // State for selected file

  useEffect(() => {
    if (!course_id) { // Use course_id
      setError('Course ID is missing.');
      setLoading(false);
      return;
    }

    const fetchContentAndCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching content for course_id: ${course_id}`); // Use course_id
        // Log the user object to ensure it's passed correctly
        console.log('CourseContent - User object:', user);
        const fetchedContent = await getCourseContent(course_id); // Use course_id
        console.log('CourseContent - Raw fetchedContent:', JSON.stringify(fetchedContent, null, 2)); // Log raw fetched content

        // Assuming API returns objects with 'name' and 'type' or we derive them
        const processedContent = fetchedContent.map(item => ({
            ...item,
            // Ensure 'id', 'name' and 'type' are present, deriving if necessary
            id: item.id || item.article_id || item.file_id, // Use existing id, or article_id, or file_id
            name: item.name || (item.article_id ? `Article ID: ${item.article_id}` : `File ID: ${item.file_id}`),
            type: item.type || (item.article_id ? 'article' : 'file')
        }));
        console.log('CourseContent - Processed content:', JSON.stringify(processedContent, null, 2)); // Log processed content
        setContent(processedContent);

        // Placeholder for fetching course name - ideally from a course details API endpoint
        // For now, use a simple mapping or default
        if (course_id === "1") {
            setCourseName("Mathematics 101");
        } else if (course_id === "2") {
            setCourseName("History of Art");
        } else {
            // In a real app, you might fetch course details here
            // const courseDetails = await getCourseDetails(course_id);
            // setCourseName(courseDetails.name);
            setCourseName(`Course ${course_id}`); // Fallback
        }

      } catch (err) {
        console.error('Error fetching course content:', err);
        setError(err.message || 'Failed to load course content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContentAndCourseDetails();
  }, [course_id]);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    // Optionally, refresh content if modal might have made changes that were cancelled
    // refreshContent();
  }

  const handleBackToContent = () => {
    setSelectedArticleId(null);
    setSelectedFileId(null);
  };

  const refreshContent = async () => {
    setLoading(true);
    setError(null); // Clear previous errors before refreshing
    try {
        console.log(`Refreshing content for course_id: ${course_id}`);
        const fetchedContent = await getCourseContent(course_id);
        const processedContent = fetchedContent.map(item => ({
            ...item,
            name: item.name || (item.article_id ? `Article ID: ${item.article_id}` : `File ID: ${item.file_id}`),
            type: item.type || (item.article_id ? 'article' : 'file')
        }));
        setContent(processedContent);
    } catch (err) {
        console.error('Error refreshing course content:', err);
        setError(err.message || 'Failed to refresh content.');
    } finally {
        setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await downloadFile(fileId);
      if (response.success) {
        const blob = await response.data.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `file_${fileId}`; // Use provided file name or a default
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('File downloaded successfully!');
      } else {
        alert(`Failed to download file: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Error downloading file: ${error.message}`);
    }
  };

  const handleAddContent = async (newContentData) => {
    console.log('Attempting to add content with data from modal:', newContentData);
    setShowAddModal(false); // Close modal immediately
    setLoading(true); // Show loading state for add operation
    try {
      const response = await addCourseContent(course_id, newContentData.article_id, newContentData.file_id);
      if (response.success) {
        alert(response.message || 'Content added successfully!');
        await refreshContent();
      } else {
        throw new Error(response.message || 'Failed to add content from API.');
      }
    } catch (err) {
      console.error("Error adding course content:", err);
      // Keep modal closed, show error in main page
      setError(err.message || "An error occurred while adding content.");
      alert(`Error: ${err.message || "An error occurred while adding content."}`);
      setLoading(false); // Ensure loading is stopped on error
    }
  };

  const handleDeleteContent = async (itemToDelete) => {
    if (!window.confirm("Are you sure you want to delete this content?")) {
        return;
    }
    setLoading(true); // Show loading state for delete operation
    console.log(`Attempting to delete content:`, itemToDelete);
    try {
        const response = await deleteCourseContent(course_id, itemToDelete.article_id, itemToDelete.file_id);
        if (response.success) {
            alert(response.message || 'Content deleted successfully!');
            await refreshContent(); // Refresh content from server
        } else {
            throw new Error(response.message || 'Failed to delete content from API.');
        }
    } catch (err) {
        console.error("Error deleting course content:", err);
        setError(err.message || "An error occurred while deleting content.");
        alert(`Error: ${err.message || "An error occurred while deleting content."}`);
        setLoading(false); // Ensure loading is stopped on error
    }
  };

  // Render ArticleView or FileListAndDownload if selected
  if (selectedArticleId) {
    return (
      <Container fluid className="mt-4">
        <Button variant="secondary" onClick={handleBackToContent} className="mb-3">
          &larr; Back to Course Content
        </Button>
        <ArticleView articleId={selectedArticleId} />
      </Container>
    );
  }

  if (selectedFileId) {
    return (
      <Container fluid className="mt-4">
        <Button variant="secondary" onClick={handleBackToContent} className="mb-3">
          &larr; Back to Course Content
        </Button>
        <FileListAndDownload fileId={selectedFileId} />
      </Container>
    );
  }

  // Initial loading state
  if (loading && content.length === 0 && !error) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading course content...</p>
      </Container>
    );
  }

  // Initial error state (e.g. course_id missing or first fetch failed)
  if (error && content.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        {course_id && <Button onClick={refreshContent}>Try Again</Button>}
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Display non-critical errors (e.g., failed delete/add) as dismissible alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      <Row className="align-items-center mb-4">
        <Col>
          <h2>{courseName} - Content</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal}>
            + Add Content
          </Button>
        </Col>
      </Row>

      {/* Loading indicator for refresh/add/delete operations */}
      {loading && <div className="text-center mb-3"><Spinner animation="border" size="sm" /> Processing...</div>}

      {!loading && content.length === 0 && !error ? (
        <Alert variant="info">No content has been added to this course yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {content.map((item) => (
            <Col key={item.id}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Type: {item.type}
                  </Card.Subtitle>
                  <Card.Text>
                    Added: {new Date(item.create_time).toLocaleString()}
                  </Card.Text>
                  {item.type === 'article' ? (
                    <Button variant="link" onClick={() => setSelectedArticleId(item.article_id)}> {/* Changed setActiveComponent */}
                      View Article
                    </Button>
                  ) : (
                    <Button variant="link" onClick={() => setSelectedFileId(item.file_id)}> {/* Changed setActiveComponent */}
                      View File
                    </Button>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteContent(item)} disabled={loading}>
                    Delete
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <AddCourseContentModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        courseId={course_id}
        onAddContent={handleAddContent}
        user={user}
      />
    </Container>
  );
};

export default CourseContent;
