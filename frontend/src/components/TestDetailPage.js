import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TestDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Test Detail Page</h1>
      <p>ID parameter: {id || 'None'}</p>
      <p>This is a simple test page to verify routing.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
};

export default TestDetailPage;
