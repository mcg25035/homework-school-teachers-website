import React from 'react';
import { useComment } from '../api';
import { ListGroup, Alert, Spinner } from 'react-bootstrap'; // Card removed as per instruction, sticking to ListGroup

function CommentList({ articleId }) {
  const { comments, isLoading, isError } = useComment(null, articleId);

  if (isLoading) return <Spinner animation="border" size="sm" role="status"><span className="visually-hidden">Loading comments...</span></Spinner>;
  if (isError) return <Alert variant="warning">Could not load comments. Please try again later.</Alert>;

  if (!comments || comments.length === 0) {
    return <p className="text-muted mt-3">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="mt-4"> {/* Added a little top margin for separation */}
      {/* <h5>Comments:</h5> // Optional: Title for the comment section */}
      <ListGroup variant="flush">
        {comments.map(comment => (
          <ListGroup.Item key={comment.comment_id} className="mb-2 border rounded px-3 py-2"> {/* Added some padding and rounded border */}
            <div className="d-flex w-100 justify-content-between">
              <h6 className="mb-1 fw-bold"> {/* Made username bold */}
                {comment.username || `User ID: ${comment.user_id}`}
              </h6>
              <small className="text-muted">
                {/* Basic date formatting, ensure created_at is a valid date string/timestamp */}
                {/* Adding a check for created_at to prevent errors if it's unexpectedly null/undefined */}
                {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Date not available'}
              </small>
            </div>
            <p className="mb-1 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p> {/* Preserve whitespace in comments */}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default CommentList;
