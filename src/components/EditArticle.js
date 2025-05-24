import React, { useState, useEffect } from 'react';
import { useArticle, updateArticle } from '../api';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

function EditArticle({ articleId, user, setActiveComponent }) {
  const { article: initialArticle, isLoading: isFetchingInitial, isError: fetchErrorInitial, mutate } = useArticle(articleId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // isFetching is for the initial load, to distinguish from isSubmitting
  const [isFetching, setIsFetching] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    setIsFetching(isFetchingInitial);
  }, [isFetchingInitial]);

  useEffect(() => {
    if (fetchErrorInitial) {
      setError("Failed to load article for editing.");
      setIsFetching(false); // Ensure loading state is turned off on error
    }
  }, [fetchErrorInitial]);

  useEffect(() => {
    if (initialArticle) {
      // Basic authorization check: only author can edit
      if (user && user.user_id === initialArticle.author_id) {
        setTitle(initialArticle.title);
        setContent(initialArticle.content);
        setError(null); // Clear any previous fetch errors if article is loaded and authorized
      } else {
        setError("You are not authorized to edit this article.");
        setTitle(''); 
        setContent('');
      }
      setIsFetching(false); // Data processed, stop fetching indicator
    }
  }, [initialArticle, user]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }
    
    // Ensure user is still authorized before submitting
    if (!user || !initialArticle || user.user_id !== initialArticle.author_id) {
        setError("Authorization error. Cannot update article.");
        return;
    }

    setIsSubmitting(true);
    const articleData = { title, content };

    try {
      const result = await updateArticle(articleId, articleData);
      // Assuming result is { success: true } or { error: "message" }
      if (result && result.success) {
        setSuccessMessage('Article updated successfully!');
        if (mutate) mutate(); // Revalidate the article data for ArticleView using SWR's mutate
        setTimeout(() => {
          setActiveComponent('ArticleView', { articleId });
        }, 1500);
      } else {
        setError(result.error || 'Failed to update article. Please check the details and try again.');
      }
    } catch (err) {
      const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setError('An unexpected error occurred: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display spinner while fetching initial data
  if (isFetching) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading article...</span></Spinner>;
  
  // Display error if fetching failed or if user is not authorized after data is fetched (or attempted)
  if (error && (!initialArticle || (initialArticle && user?.user_id !== initialArticle.author_id))) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  // This case handles if initialArticle is null after loading and no specific error was set (e.g. 404 not found)
  if (!initialArticle && !isFetching && !error) {
    return <Alert variant="warning">Article not found or could not be loaded.</Alert>;
  }

  // Authorization check specific for rendering the form (redundant if error state above covers it, but good for clarity)
  const isAuthorized = initialArticle && user && user.user_id === initialArticle.author_id;


  return (
    <Card>
      <Card.Body>
        <Card.Title>Edit Article</Card.Title>
        {/* Display submission errors or success messages */}
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
        
        {/* Only render form if authorized */}
        {isAuthorized ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="articleTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="articleContent">
              <Form.Label>Content</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={10} 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
                disabled={isSubmitting}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </Form>
        ) : (
          // This message is shown if the user was initially authorized but something changed, 
          // or if the error state wasn't caught by the top-level error display.
          // The main authorization error display is handled by the `if (error && ...)` block above.
          <Alert variant="danger">You are not authorized to edit this article.</Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default EditArticle;
