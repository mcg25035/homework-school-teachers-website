import React, { useState, useEffect } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';
import { Container, Card, Button, Collapse, Alert, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useLoginStatus, useTeacherPage, updateTeacherPage } from '../api';

const markdownCheatsheet = `
#### Markdown Cheatsheet
# H1, ## H2, ### H3
*italic*, **bold**, ***bold italic***
Unordered: - Item1 - Item2
Ordered: 1. Item1 2. Item2
[Link](url), ![Image](url)
Inline \`code\`, Code block: \`\`\` code \`\`\`
> Blockquote
--- (Horizontal Rule)
`;

const PREDEFINED_VARIABLES = ['office_hours', 'research_interests', 'contact_email'];

function TeacherPersonalPageEditor() {
  const { user, isLoading: isLoadingUser, isError: isErrorUser } = useLoginStatus();
  
  const { 
    data: teacherPageData, 
    isLoading: isLoadingPageDataOriginal, 
    isError: isErrorPageData,
    // mutate: revalidateTeacherPage // Exposed by useTeacherPage, can be used for manual revalidation
  } = useTeacherPage(user ? user.user_id : null, {
    shouldRetryOnError: false, 
  });
  
  const isLoadingInitialData = isLoadingUser || (user && isLoadingPageDataOriginal);

  const [markdownContent, setMarkdownContent] = useState('');
  const [pageVariables, setPageVariables] = useState({});
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  
  const [newCustomKeyName, setNewCustomKeyName] = useState('');

  useEffect(() => {
    // This effect is responsible for initializing or resetting the form
    // when the primary data source (teacherPageData) or the user changes.
    if (user && teacherPageData) {
      // Data is available for the current user
      setMarkdownContent(teacherPageData.content || `# Welcome, ${user.username}!\n\nStart editing your personal page content here.`);
      setPageVariables(teacherPageData.variables && typeof teacherPageData.variables === 'object' ? teacherPageData.variables : {});
    } else if (user && !teacherPageData && !isLoadingPageDataOriginal && !isErrorPageData) {
      // User is loaded, no data, not currently loading, and no error fetching.
      // This typically means it's a new page for the user.
      setMarkdownContent(`# Welcome, ${user.username}!\n\nStart editing your personal page content here.`);
      setPageVariables({});
    }
    // Explicitly not including isLoadingPageDataOriginal or isErrorPageData in the dependency array here.
    // We only want to re-initialize the form fields if the actual 'user' or 'teacherPageData' identity changes,
    // or if 'teacherPageData' transitions from undefined to defined (or vice-versa if user logs out etc).
    // Local edits to markdownContent or pageVariables should not be wiped out by this effect
    // simply because a loading state changed but the core data (teacherPageData) did not.
  }, [user, teacherPageData]); // Key dependencies for re-initialization.

  const handleEditorChange = ({ text }) => {
    setMarkdownContent(text);
  };

  const handleVariableChange = (key, value) => {
    setPageVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleAddVariable = () => {
    const trimmedKey = newCustomKeyName.trim().replace(/\s+/g, '_').toLowerCase();
    if (!trimmedKey) {
      alert("Please enter a name for the new custom variable.");
      return;
    }
    if (PREDEFINED_VARIABLES.includes(trimmedKey) || pageVariables.hasOwnProperty(trimmedKey)) {
      alert(`Variable key "${trimmedKey}" is either predefined or already exists. Please choose a unique name.`);
      return;
    }
    setPageVariables(prev => ({ ...prev, [trimmedKey]: '' }));
    setNewCustomKeyName(''); 
  };
  
  const handleRemoveVariable = (keyToRemove) => {
    setPageVariables(prev => {
      const { [keyToRemove]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleVariableKeyChange = (oldKey, newKeyInput) => {
    const newKey = newKeyInput.trim().replace(/\s+/g, '_').toLowerCase();
    
    if (oldKey === newKey) return;

    if (!newKey) {
      alert("New key name cannot be empty. Key change aborted.");
      // Consider reverting the input visual state if possible, or rely on onBlur not to save empty.
      return; 
    }
    if (PREDEFINED_VARIABLES.includes(newKey) || (pageVariables.hasOwnProperty(newKey) && newKey !== oldKey) ) {
      alert(`New key name "${newKey}" is either predefined or already exists. Key change aborted.`);
      return;
    }

    setPageVariables(prev => {
      if (Object.prototype.hasOwnProperty.call(prev, oldKey)) {
        const { [oldKey]: value, ...rest } = prev;
        return { ...rest, [newKey]: value };
      }
      return prev; // Should not happen if oldKey was from a valid map iteration
    });
  };

  const handleSave = async () => {
    if (!user) {
      setSaveErrorMessage("You must be logged in to save. Please refresh if you are logged in.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMessage('');
    setSaveErrorMessage('');
    try {
      const variablesToSave = typeof pageVariables === 'object' && pageVariables !== null ? pageVariables : {};
      const result = await updateTeacherPage(user.user_id, markdownContent, variablesToSave);
      if (result.success) {
        setSaveSuccessMessage("Page updated successfully!");
      } else {
        setSaveErrorMessage(result.error || "Failed to update page. Please try again.");
      }
    } catch (error) {
      setSaveErrorMessage(error.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser) {
    return <Container className="text-center mt-5"><Spinner animation="border" /> Loading User Data...</Container>;
  }
  if (isErrorUser) {
    return <Container className="mt-3"><Alert variant="danger">Error loading user data. Please try refreshing the page.</Alert></Container>;
  }
  if (!user) {
    return <Container className="mt-3"><Alert variant="warning">Please log in to edit your personal page.</Alert></Container>;
  }
  if (isLoadingPageDataOriginal) { 
    return <Container className="text-center mt-5"><Spinner animation="border" /> Loading Page Data...</Container>;
  }
  if (isErrorPageData) {
    return <Container className="mt-3"><Alert variant="danger">Error loading page data: {isErrorPageData.message}. You can try creating content and saving, or refresh.</Alert></Container>;
  }
  
  const customVariablesToDisplay = Object.entries(pageVariables).filter(
    ([key]) => !PREDEFINED_VARIABLES.includes(key)
  );

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">Edit Your Personal Page ({user.username})</Card.Header>
        <Card.Body>
          {saveSuccessMessage && <Alert variant="success" onClose={() => setSaveSuccessMessage('')} dismissible>{saveSuccessMessage}</Alert>}
          {saveErrorMessage && <Alert variant="danger" onClose={() => setSaveErrorMessage('')} dismissible>{saveErrorMessage}</Alert>}

          <div className="mb-3">
            <Button onClick={() => setShowCheatsheet(!showCheatsheet)} variant="outline-info" size="sm" aria-controls="markdown-cheatsheet-collapse" aria-expanded={showCheatsheet}>
              {showCheatsheet ? 'Hide' : 'Show'} Markdown Cheatsheet
            </Button>
            <Collapse in={showCheatsheet}>
              <div id="markdown-cheatsheet-collapse" className="mt-2">
                <Alert variant="light" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>{markdownCheatsheet}</Alert>
              </div>
            </Collapse>
          </div>

          <h5>Page Content (Markdown)</h5>
          <MdEditor
            value={markdownContent}
            style={{ height: '400px' }}
            onChange={handleEditorChange}
            renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
            config={{ view: { menu: true, md: true, html: true }, canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true }}}
          />
          
          <hr className="my-4" />
          <h5>Page Variables</h5>
          
          <h6>Predefined Variables</h6>
          {PREDEFINED_VARIABLES.map(key => (
            <Form.Group as={Row} className="mb-3" controlId={`form-predefined-${key}`} key={key}>
              <Form.Label column sm={3} style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  value={pageVariables[key] || ''}
                  onChange={(e) => handleVariableChange(key, e.target.value)}
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              </Col>
            </Form.Group>
          ))}

          <h6 className="mt-4">Custom Variables</h6>
          {customVariablesToDisplay.map(([key, value]) => (
            <Form.Group as={Row} className="mb-2 align-items-center" key={key}>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  defaultValue={key} 
                  onBlur={(e) => handleVariableKeyChange(key, e.target.value)}
                  placeholder="Variable Name"
                />
              </Col>
              <Col sm={6}>
                <Form.Control
                  type="text"
                  value={value || ''} 
                  onChange={(e) => handleVariableChange(key, e.target.value)}
                  placeholder="Variable Value"
                />
              </Col>
              <Col sm={2}>
                {/* This check is technically redundant if customVariablesToDisplay is correctly filtered,
                    but provides an explicit safeguard at the button rendering site. */}
                {!PREDEFINED_VARIABLES.includes(key) && (
                  <Button variant="outline-danger" size="sm" onClick={() => handleRemoveVariable(key)}>Remove</Button>
                )}
              </Col>
            </Form.Group>
          ))}
          
          <Row className="mt-3 mb-3 align-items-center">
            <Col xs={12} sm={4} className="mb-2 mb-sm-0">
              <Form.Control 
                type="text" 
                placeholder="New variable name" 
                value={newCustomKeyName}
                onChange={(e) => setNewCustomKeyName(e.target.value)} 
              />
            </Col>
            <Col xs={12} sm={6}>
                <Button variant="outline-success" onClick={handleAddVariable} size="sm">Add Custom Variable</Button>
            </Col>
          </Row>

          <div className="mt-4 text-end">
            <Button variant="primary" onClick={handleSave} disabled={isSaving || isLoadingInitialData}>
              {isSaving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</> : 'Save Page'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeacherPersonalPageEditor;
