import React, { useState } from 'react';
import { createComment, useLoginStatus } from '../api';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function CreateComment({ articleId, parentCommentId = null, onCommentCreated, placeholder = "Write a comment..." }) {
  const { user, isLoggedIn, isLoading: isLoadingUser } = useLoginStatus();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (isLoadingUser) {
    return <Spinner animation="border" size="sm" role="status"><span className="visually-hidden">Loading user status...</span></Spinner>;
  }

  if (!isLoggedIn || !user) {
    return <Alert variant="info" className="mt-3">Please log in to post a comment.</Alert>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const commentData = { 
      article_id: articleId, 
      user_id: user.user_id,
      content,
      parent_comment_id: parentCommentId // Include parentCommentId if it exists
    };

    try {
      const result = await createComment(commentData); 
      if (result && result.success) {
        setContent('');
        if (onCommentCreated) {
          onCommentCreated(); // Notify parent component that comment was created
        }
      } else {
        setError(result && result.error ? result.error : 'Failed to post comment. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setError('An unexpected error occurred: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      <Form.Group className="mb-3" controlId="commentContent">
        <Form.Label>Your Comment</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          disabled={isSubmitting}
          placeholder={placeholder} // Use the placeholder prop
        />
      </Form.Group>
      <Button variant="primary" type="submit" disabled={isSubmitting}>
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
