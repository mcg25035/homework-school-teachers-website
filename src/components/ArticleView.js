import React from 'react';
import { useArticle, deleteArticle } from '../api';
import { Alert, Spinner, Button, Card } from 'react-bootstrap'; // Removed Modal for now as per instruction
import CommentList from './CommentList';
import CreateComment from './CreateComment';

function ArticleView({ articleId, user, setActiveComponent }) {
  const { article, isLoading, isError } = useArticle(articleId); // mutate might be needed for revalidating after delete/edit, not using for now

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(article.article_id); // Assuming deleteArticle returns a promise that resolves on success or throws error
        alert('Article deleted successfully'); // Or a more subtle notification
        setActiveComponent('ArticleList');
        // SWR should handle revalidation of ArticleList if deleteArticle in api.js is set up for it
        // No need to call mutate() here if SWR handles cache invalidation for the articles list
      } catch (error) {
        // Assuming error object has a message property or can be stringified
        const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;
        alert('Error deleting article: ' + errorMessage);
      }
    }
  };

  if (isLoading) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  // Ensure article is checked after loading
  if (isError) return <Alert variant="danger">Error loading article.</Alert>;
  if (!article) return <Alert variant="warning">Article not found.</Alert>;


  const canManageArticle = user && article && user.user_id === article.author_id;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        {canManageArticle && (
          <div className="mb-3"> {/* Increased margin bottom for better spacing */}
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2"
              onClick={() => setActiveComponent('EditArticle', { articleId: article.article_id })}
            >
              Edit Article
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleDelete}
            >
              Delete Article
            </Button>
          </div>
        )}
        {/* Using pre-wrap to preserve whitespace and newlines in article content */}
        <Card.Text style={{ whiteSpace: 'pre-wrap' }}> 
          {article.content}
        </Card.Text>
        <hr />
        <h4>Comments</h4>
        <CommentList articleId={article.article_id} />
      </Card.Body>
    </Card>
  );
}

export default ArticleView;
