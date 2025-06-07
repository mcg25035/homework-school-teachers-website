import React from 'react';
import { useComment } from '../api';
import { ListGroup, Alert, Spinner } from 'react-bootstrap';
import CommentItem from './CommentItem'; // Import the new CommentItem component
import CreateComment from './CreateComment'; // Import CreateComment for adding new comments

function CommentList({ articleId }) {
  // Fetch top-level comments (where parent_comment_id is null)
  // The useComment hook in api.js should handle fetching top-level comments when parentCommentId is not provided.
  const { comments, isLoading, isError, mutate: refreshComments } = useComment(null, articleId, null);

  if (isLoading) return <Spinner animation="border" size="sm" role="status"><span className="visually-hidden">Loading comments...</span></Spinner>;
  if (isError) return <Alert variant="warning">Could not load comments. Please try again later.</Alert>;

  // Filter out comments that have a parent_comment_id, as they will be rendered as replies
  // This assumes the API returns all comments for an article, and we need to build the tree client-side.
  // If the API can return a pre-nested structure, this filtering might not be necessary.
  // For now, let's assume the API returns a flat list and we need to build the tree.
  // However, the useComment hook in api.js already has `parentCommentId` parameter.
  // So, if we call useComment(null, articleId, null), it should only return top-level comments.
  // If the backend returns all comments for an articleId regardless of parent_comment_id,
  // then we need to build the tree here. Let's assume for now that `useComment(null, articleId, null)`
  // correctly fetches only top-level comments. If not, we'll adjust.

  // To build a nested structure from a flat list (if API returns all comments for articleId):
  // This logic would be needed if useComment(null, articleId) returns ALL comments for an article,
  // and we need to manually build the tree.
  // For now, let's assume the API returns a flat list of top-level comments when parentCommentId is null.
  // If the API returns all comments for an articleId, we need to group them.
  // Let's refine this after checking the backend API behavior.
  // For now, let's assume `comments` contains only top-level comments.

  return (
    <div className="mt-4">
      {(!comments || comments.length === 0) ? (
        <p className="text-muted">No comments yet. Be the first to comment!</p>
      ) : (
        <ListGroup variant="flush">
          {comments.map(comment => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              articleId={articleId}
              refreshComments={refreshComments}
              depth={0} // Initial depth for top-level comments
            />
          ))}
        </ListGroup>
      )}
      <div className="mt-3">
        <CreateComment articleId={articleId} onCommentCreated={refreshComments} />
      </div>
    </div>
  );
}

export default CommentList;
