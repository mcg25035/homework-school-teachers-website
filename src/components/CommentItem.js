import React, { useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import CreateComment from './CreateComment'; // For replying to comments

function CommentItem({ comment, articleId, refreshComments, depth }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Determine indentation based on depth
  const indentation = depth * 20; // 20px per level of depth

  const handleReplyClick = () => {
    setShowReplyForm(prev => !prev);
  };

  const handleReplyCreated = () => {
    setShowReplyForm(false); // Hide form after successful reply
    refreshComments(); // Refresh comments to show the new reply
    setShowReplies(true); // Automatically show replies when a new one is added
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
      <p className="mb-1 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>

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
              />
            ))}
          </ListGroup>
        </div>
      )}
    </ListGroup.Item>
  );
}

export default CommentItem;
