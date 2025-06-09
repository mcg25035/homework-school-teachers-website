import React, { useState } from 'react';
import { ListGroup, Button, Form, Alert } from 'react-bootstrap';
import CreateComment from './CreateComment'; // For replying to comments
import { deleteComment, updateComment } from '../api'; // Import API functions

function CommentItem({ comment, articleId, refreshComments, depth, currentUserId, articleAuthorId }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [error, setError] = useState(null);

  console.log('CommentItem - comment.comment_id:', comment.comment_id);
  console.log('CommentItem - currentUserId:', currentUserId);
  console.log('CommentItem - comment.user_id:', comment.user_id);
  console.log('CommentItem - articleAuthorId:', articleAuthorId);

  // Determine indentation based on depth
  const indentation = depth * 20; // 20px per level of depth

  const isCommentAuthor = currentUserId === comment.user_id;
  const isArticleAuthor = currentUserId === articleAuthorId;
  const canDelete = isCommentAuthor || isArticleAuthor;
  const canEdit = isCommentAuthor;

  const handleReplyClick = () => {
    setShowReplyForm(prev => !prev);
  };

  const handleReplyCreated = () => {
    setShowReplyForm(false); // Hide form after successful reply
    refreshComments(); // Refresh comments to show the new reply
    setShowReplies(true); // Automatically show replies when a new one is added
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setError(null);
      const result = await deleteComment(comment.comment_id, articleId);
      if (result.success) {
        refreshComments();
      } else {
        setError(result.error || 'Failed to delete comment.');
      }
    }
  };

  const handleEditClick = () => {
    setShowEditForm(prev => !prev);
    setEditedContent(comment.content); // Reset content when opening/closing form
    setError(null);
  };

  const handleUpdateComment = async () => {
    setError(null);
    if (editedContent.trim() === '') {
      setError('Comment content cannot be empty.');
      return;
    }

    const result = await updateComment(comment.comment_id, {
      content: editedContent,
      article_id: articleId // Pass article_id for revalidation
    });

    if (result.success) {
      setShowEditForm(false);
      refreshComments();
    } else {
      setError(result.error || 'Failed to update comment.');
    }
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <ListGroup.Item
      key={comment.comment_id}
      className="mb-2 border rounded px-3 py-2"
      style={{ marginLeft: `${indentation}px` }} // Apply indentation
    >
      <div className="d-flex w-100 justify-content-between">
        <h6 className="mb-1 fw-bold">
          {comment.username || `User ID: ${comment.user_id}`}
        </h6>
        <small className="text-muted">
          {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Date not available'}
        </small>
      </div>

      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

      {showEditForm ? (
        <div className="mt-2">
          <Form.Control
            as="textarea"
            rows={3}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="mb-2"
          />
          <div className="d-flex justify-content-end">
            <Button variant="secondary" size="sm" onClick={handleEditClick} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateComment}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-1 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
      )}

      <div className="d-flex justify-content-end align-items-center">
        {hasReplies && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowReplies(prev => !prev)}
            className="p-0 me-2 text-decoration-none"
          >
            {showReplies ? `Hide ${comment.replies.length} replies` : `View ${comment.replies.length} replies`}
          </Button>
        )}
        <Button variant="link" size="sm" onClick={handleReplyClick} className="p-0 text-decoration-none">
          Reply
        </Button>
        {canEdit && (
          <Button variant="link" size="sm" onClick={handleEditClick} className="p-0 ms-2 text-decoration-none">
            Edit
          </Button>
        )}
        {canDelete && (
          <Button variant="link" size="sm" onClick={handleDelete} className="p-0 ms-2 text-decoration-none text-danger">
            Delete
          </Button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2">
          <CreateComment
            articleId={articleId}
            parentCommentId={comment.comment_id}
            onCommentCreated={handleReplyCreated}
            placeholder={`Reply to ${comment.username || `User ID: ${comment.user_id}`}`}
          />
        </div>
      )}

      {hasReplies && showReplies && (
        <div className="mt-3">
          <ListGroup variant="flush">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.comment_id}
                comment={reply}
                articleId={articleId}
                refreshComments={refreshComments}
                depth={depth + 1} // Increment depth for nested replies
                currentUserId={currentUserId} // Pass current user ID to replies
                articleAuthorId={articleAuthorId} // Pass article author ID to replies
              />
            ))}
          </ListGroup>
        </div>
      )}
    </ListGroup.Item>
  );
}

export default CommentItem;
