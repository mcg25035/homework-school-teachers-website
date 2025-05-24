import React, { useState } from 'react';
import { createArticle } from '../api';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

function CreateArticle({ setActiveComponent, user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    // Assumption: backend expects teacher_id for the author from the user object's user_id
    const articleData = { title, content, teacher_id: user.user_id }; 

    try {
      const result = await createArticle(articleData);
      // Assuming result is the direct response from the backend, 
      // and a successful creation might return the article object or a specific success flag.
      // For now, let's assume if no error is thrown, it's a success, 
      // or if result itself indicates success (e.g. result.article_id or result.success)
      // The subtask description suggests `result.success`
      if (result && result.success) { // Check if result exists and has a success property
        setSuccessMessage('Article created successfully!');
        setTitle('');
        setContent('');
        setTimeout(() => {
          setActiveComponent('ArticleList'); 
        }, 1500);
      } else if (result && result.error) { // Check if result exists and has an error property
        setError(result.error);
      } else {
        // Fallback error if the response format isn't as expected but doesn't throw
        setError('Failed to create article. Unexpected response from server.');
      }
    } catch (err) {
      // This will catch network errors or errors thrown by createArticle itself
      const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setError('An unexpected error occurred: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Create New Article</Card.Title>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="articleTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter article title"
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
              placeholder="Write your article content here"
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
                {' '}Submitting...
              </>
            ) : 'Create Article'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default CreateArticle;
