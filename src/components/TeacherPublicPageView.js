import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Or expect teacher_user_id as a prop
import { useTeacherPage } from '../api'; // Adjust path if necessary
import { Alert, Spinner, Container, Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown'; // Will be used later

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

function TeacherPublicPageView({ teacherUserIdFromProp }) { // Can also get from URL
  // If using URL params (e.g. /teacher/:teacherId/page)
  // const { teacherId: teacherIdFromUrl } = useParams();
  // const teacher_user_id = teacherUserIdFromProp || parseInt(teacherIdFromUrl);

  // For now, assume teacherUserIdFromProp is provided and valid
  // In a real app, you'd need robust logic to determine the ID
  const teacher_user_id = teacherUserIdFromProp;

  const {
    data: teacherPageData,
    isLoading,
    isError,
    error,
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
          Error loading teacher page: {error?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!teacherPageData || !teacherPageData.success) {
    return (
      <Container className="mt-3">
        <Alert variant="warning">
          Teacher page data could not be retrieved. Message: {teacherPageData?.message || 'No data available.'}
        </Alert>
      </Container>
    );
  }
  
  // teacherPageData.data should contain { user_id, content, variables }
  const { content: rawContent, variables } = teacherPageData.data || { content: '', variables: {} };

  // Placeholder for substitution - will be enhanced in the next step
  const processedContent = substituteVariables(rawContent, variables);

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">Teacher's Page</Card.Header> {/* Consider making title dynamic if available */}
        <Card.Body>
          {teacherPageData.data && teacherPageData.data.content !== null ? (
            // Render the processed content using ReactMarkdown
            // The fallback message is handled if processedContent is null/empty due to rawContent being null/empty.
            <ReactMarkdown>{processedContent || "This teacher has not set up their page content yet."}</ReactMarkdown>
          ) : (
            <Alert variant="info">This teacher has not set up their page content yet.</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeacherPublicPageView;
