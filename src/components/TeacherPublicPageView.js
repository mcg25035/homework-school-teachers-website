import React, { useEffect } from 'react';
// import { useParams } from 'react-router-dom'; // Or expect teacher_user_id as a prop // REMOVED
import { useTeacherPage } from '../api'; // Adjust path if necessary
import { Alert, Spinner, Container, Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

// In src/components/TeacherPublicPageView.js

const substituteVariables = (content, variables) => {
  if (!content || !variables || Object.keys(variables).length === 0) {
    return content; // Return original content if no content, no variables, or empty variables object
  }

  let processedContent = content;

  for (const key in variables) {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      // const placeholder = `%${key}%`; // Placeholder format is %key%
      const value = variables[key]; // Already a string as per API spec and api.js handling
      
      // Using a RegExp for global replacement (all occurrences)
      // Assuming keys are simple alphanumeric strings as per task instructions.
      // If keys could have special regex characters, they would need escaping:
      // const escapedKey = key.replace(/[.*+?^${}()|[\]\]/g, '\$&');
      // const regex = new RegExp(`%${escapedKey}%`, 'g');
      const regex = new RegExp(`%${key}%`, 'g');
      
      processedContent = processedContent.replace(regex, value);
    }
  }

  return processedContent;
};

function TeacherPublicPageView({ teacherUserIdFromProp }) { 
  // For now, assume teacherUserIdFromProp is provided and valid
  // In a real app, you'd need robust logic to determine the ID
  const teacher_user_id = teacherUserIdFromProp; // Confirmed: teacher_user_id comes from prop

  const {
    data: teacherPageData, // This is { user_id, content, variables } or default from useTeacherPage
    isLoading,
    isError,
    error, // This is the error object/message from useTeacherPage
  } = useTeacherPage(teacher_user_id);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading teacher page...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="mt-3">
        <Alert variant="danger">
          Error loading teacher page: {error?.message || 'An unknown error occurred.'}
        </Alert>
      </Container>
    );
  }

  // If not loading and no error, teacherPageData should be available
  // (useTeacherPage provides a default structure if API data is missing but not an error)
  const { content: rawContent, variables } = teacherPageData || { content: null, variables: {} };
  
  // Substitute variables (this part is fine)
  const processedContent = substituteVariables(rawContent, variables);

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">Teacher's Page</Card.Header> {/* Consider making title dynamic if available */}
        <Card.Body>
          {(rawContent !== null && rawContent.trim() !== '') ? (
            <ReactMarkdown>{processedContent}</ReactMarkdown>
          ) : (
            <Alert variant="info">This teacher has not set up their page content yet, or the content is empty.</Alert>
          )}
          {/* Variables debugging display is now removed */}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeacherPublicPageView;
