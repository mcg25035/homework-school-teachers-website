import React from 'react';
import { useArticle } from '../api';

function Component1() {
  const { article, isLoading, isError } = useArticle(1);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div>
      <h1>Component 1</h1>
      {article ? (
        <div>
          <h2>{article.title}</h2>
          <p>{article.content}</p>
        </div>
      ) : (
        <div>No article found.</div>
      )}
    </div>
  );
}

export default Component1;
