import React, { useState, useEffect } from 'react';
import { useArticle, useLoginStatus } from '../api';
// import { Link } from 'react-router-dom'; // Not using Link for now
import { ListGroup, Button, Alert, Spinner } from 'react-bootstrap';

function ArticleList({ setActiveComponent, user }) {
  const { articles, isLoading, isError } = useArticle(); // Fetches all articles

  if (isLoading) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  if (isError) return <Alert variant="danger">Error loading articles. Please try again later.</Alert>;

  return (
    <div>
      <h2>Articles</h2>
      {user && (
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={() => setActiveComponent('CreateArticle')}
        >
          Create New Article
        </Button>
      )}
      <ListGroup>
        {articles && articles.length > 0 ? articles.map(article => (
          <ListGroup.Item 
            key={article.article_id} 
            action 
            onClick={() => setActiveComponent('ArticleView', { articleId: article.article_id })}
          >
            {article.title}
          </ListGroup.Item>
        )) : <ListGroup.Item>No articles found.</ListGroup.Item>}
      </ListGroup>
    </div>
  );
}

export default ArticleList;
