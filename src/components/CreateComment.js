import React, { useState } from 'react';
import { createComment } from '../api'; // SWR's mutate is not directly needed here if api.js handles it
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function CreateComment({ articleId, user }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return <Alert variant="info" className="mt-3">Please log in to post a comment.</Alert>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const commentData = { 
      article_id: articleId, 
      user_id: user.user_id, // Assumes user object has user_id
      content 
    };

    try {
      // Assuming createComment returns an object like { success: true } or { error: "message" }
      const result = await createComment(commentData); 
      if (result && result.success) {
        setContent(''); // Clear textarea
        // CommentList should auto-update via SWR's cache revalidation
        // which createComment in api.js should trigger.
      } else {
        // If result.error is provided, use it, otherwise a generic message
        setError(result && result.error ? result.error : 'Failed to post comment. Please try again.');
      }
    } catch (err) {
      // Handle network errors or other exceptions thrown by createComment
      const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setError('An unexpected error occurred: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4"> {/* Added a bit more margin top */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <Form.Group className="mb-3" controlId="commentContent"> {/* Increased margin bottom */}
        <Form.Label>Your Comment</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          disabled={isSubmitting} // Disable textarea while submitting
        />
      </Form.Group>
      <Button variant="primary" type="submit" disabled={isSubmitting}> {/* Changed to primary button */}
        {isSubmitting ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
            Posting...
          </>
        ) : 'Post Comment'}
      </Button>
    </Form>
  );
}

export default CreateComment;
