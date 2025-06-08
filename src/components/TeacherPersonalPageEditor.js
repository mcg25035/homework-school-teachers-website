import React, { useState, useEffect } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';
import { Container, Card, Button, Collapse, Alert, Form, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
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

---

**Using Page Variables:**

You can insert dynamic content from your 'Page Variables' section into your Markdown.
Use the syntax \`%variable_name%\` where \`variable_name\` is the exact key of the variable you defined (e.g., \`%office_hours%\`, \`%my_custom_link%\`).

These placeholders will be automatically replaced with their corresponding values when your page is viewed.

*Example:*
If you have a variable:
- Key: \`course_name\`
- Value: \`Advanced Web Development\`

And you write in your Markdown:
\`Welcome to my course: %course_name%!\`

It will be displayed as:
\`Welcome to my course: Advanced Web Development!\`
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // console.log('[Render] Initial or current newCustomKeyName state:', newCustomKeyName);

  const [hasInitializedForCurrentUser, setHasInitializedForCurrentUser] = useState(false);

  useEffect(() => {
    // This effect resets the initialization flag when the user changes.
    // This ensures that if a different user logs in, the form will re-initialize with their data.
    if (user) {
      // console.log('[useEffect userChanged] User changed or loaded. Resetting hasInitializedForCurrentUser for user:', user.user_id);
      setHasInitializedForCurrentUser(false); 
    } else {
      // User logged out, clear form and reset flag
      // console.log('[useEffect userChanged] User logged out. Clearing form and resetting hasInitializedForCurrentUser.');
      setMarkdownContent('');
      setPageVariables({});
      setHasInitializedForCurrentUser(false);
    }
  }, [user]); // Only re-run if the user object itself changes

  useEffect(() => {
    // console.log('[useEffect dataLoad] Running data load effect. Deps:', { user, teacherPageData, isLoadingPageDataOriginal, isErrorPageData, hasInitializedForCurrentUser });
    
    if (user && !hasInitializedForCurrentUser) {
      if (teacherPageData) {
        // console.log('[useEffect dataLoad] User exists, NOT YET initialized, teacherPageData exists. Initializing form from teacherPageData for user:', user.user_id);
        setMarkdownContent(teacherPageData.content || `# Welcome, ${user.username}!\n\nStart editing your personal page content here.`);
        setPageVariables(prevVars => {
          const newVars = teacherPageData.variables && typeof teacherPageData.variables === 'object' ? teacherPageData.variables : {};
          // console.log('[useEffect dataLoad] setPageVariables from teacherPageData. Prev:', prevVars, 'New:', newVars);
          return newVars;
        });
        setHasInitializedForCurrentUser(true);
      } else if (!isLoadingPageDataOriginal && !isErrorPageData) {
        // User exists, not initialized, no teacherPageData, not loading, and no error.
        // This is for a new page for the current user.
        // console.log('[useEffect dataLoad] User exists, NOT YET initialized, no teacherPageData (and not loading/error). Initializing empty form for user:', user.user_id);
        setMarkdownContent(`# Welcome, ${user.username}!\n\nStart editing your personal page content here.`);
        setPageVariables(prevVars => {
          // console.log('[useEffect dataLoad] setPageVariables to empty for new page. Prev:', prevVars);
          return {};
        });
        setHasInitializedForCurrentUser(true);
      } else {
        // console.log('[useEffect dataLoad] User exists, NOT YET initialized, but still loading or error state for teacherPageData. Waiting.');
      }
    } else if (user && hasInitializedForCurrentUser) {
        // console.log('[useEffect dataLoad] Data already initialized for user:', user.user_id, ". Subsequent teacherPageData changes might be handled by SWR revalidation or ignored here to preserve local edits unless user changes.");
        // If teacherPageData changes identity *after* initialization (e.g. SWR revalidates and provides a new object),
        // this logic currently does NOT automatically overwrite local edits. This is usually desired.
        // If forced re-sync is needed on every teacherPageData change, `hasInitializedForCurrentUser` logic would need adjustment
        // or a separate effect. For now, this protects local edits.
    } else if (!user) {
        // console.log('[useEffect dataLoad] No user, skipping data load initialization.');
    }
  }, [user, teacherPageData, isLoadingPageDataOriginal, isErrorPageData, hasInitializedForCurrentUser]);

  const handleEditorChange = ({ text }) => {
    setMarkdownContent(text);
  };

  const handleVariableChange = (key, value) => {
    setPageVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleClearPredefinedVariable = (variableKey) => {
    setPageVariables(prev => ({ ...prev, [variableKey]: "" }));
  };

  const handleAddVariable = () => {
    // console.log('[handleAddVariable] Called. Current newCustomKeyName:', newCustomKeyName);
    // console.log('[handleAddVariable] Current pageVariables (before add):', JSON.parse(JSON.stringify(pageVariables)));

    const trimmedKey = newCustomKeyName.trim().replace(/\s+/g, '_').toLowerCase();
    // console.log('[handleAddVariable] Trimmed key:', trimmedKey);

    if (!trimmedKey) {
      // console.log('[handleAddVariable] Trimmed key is empty. Alerting and returning.');
      alert("Please enter a name for the new custom variable.");
      return;
    }
    if (PREDEFINED_VARIABLES.includes(trimmedKey) || pageVariables.hasOwnProperty(trimmedKey)) {
      // console.log('[handleAddVariable] Trimmed key is predefined or already exists. Alerting and returning.');
      alert(`Variable key "${trimmedKey}" is either predefined or already exists. Please choose a unique name.`);
      return;
    }

    // console.log('[handleAddVariable] Attempting to setPageVariables with new key:', trimmedKey);
    setPageVariables(prev => {
      // console.log('[handleAddVariable] setPageVariables callback. Prev pageVariables:', JSON.parse(JSON.stringify(prev)));
      const newState = { ...prev, [trimmedKey]: '' };
      // console.log('[handleAddVariable] setPageVariables callback. New pageVariables:', JSON.parse(JSON.stringify(newState)));
      return newState;
    });
    
    // console.log('[handleAddVariable] Called setNewCustomKeyName to empty string.');
    setNewCustomKeyName(''); 
    // console.log('[handleAddVariable] After setNewCustomKeyName, newCustomKeyName should be empty now.');
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
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setAiResult(null); // Clear previous results
    try {
      const response = await fetch('/api/ai_generate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setAiResult(data);
      const aiGeneratedContent = data.mdContent;
      setMarkdownContent(aiGeneratedContent);

      // 掃描變數
      const variableRegex = /%([a-zA-Z0-9_]+)%/g;
      let match;
      const newVariables = new Set();
      while ((match = variableRegex.exec(aiGeneratedContent)) !== null) {
        const variableName = match[1];
        console.log("掃描到的變數名:", variableName);
        newVariables.add(variableName);
      }

      console.log("掃描到的所有變數:", newVariables);

      // 將新變數加入到 pageVariables 中
      setPageVariables(prev => {
        console.log("目前的 pageVariables:", prev);
        const newState = { ...prev };
        newVariables.forEach(variable => {
          console.log("正在處理變數:", variable);
          if (!newState.hasOwnProperty(variable)) {
            console.log("變數不存在，加入到 newState 中");
            newState[variable] = '';
          } else {
            console.log("變數已存在，跳過");
          }
        });
        console.log("新的 pageVariables:", newState);
        return newState;
      });

    } catch (error) {
      console.error("Error fetching AI generated content:", error);
      setSaveErrorMessage(`Error fetching AI generated content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const customVariablesToDisplay = Object.entries(pageVariables).filter(
    ([key]) => !PREDEFINED_VARIABLES.includes(key)
  );
  // console.log('[Render] pageVariables state before render:', JSON.parse(JSON.stringify(pageVariables)));
  // console.log('[Render] customVariablesToDisplay derived:', customVariablesToDisplay.map(cv => cv[0]));


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
            renderHTML={text => {
              const replaceVariables = (content, variables) => {
                if (!variables) return content;
                let replacedContent = content;
                for (const key in variables) {
                  if (variables.hasOwnProperty(key)) {
                    const variableRegex = new RegExp(`%${key}%`, 'g');
                    replacedContent = replacedContent.replace(variableRegex, variables[key] || '');
                  }
                }
                return replacedContent;
              };
              const processedText = replaceVariables(text, pageVariables);
              return <ReactMarkdown>{processedText}</ReactMarkdown>;
            }}
            config={{ view: { menu: true, md: true, html: true }, canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true }}}
          />
          
          <hr className="my-4" />
          <h5>Page Variables</h5>
          
          <h6>Predefined Variables</h6>
          {PREDEFINED_VARIABLES.map(key => (
            <Form.Group as={Row} className="mb-3" controlId={`form-predefined-${key}`} key={key}>
              <Form.Label column sm={3}>{key}</Form.Label> 
              <Col sm={9}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={pageVariables[key] || ''}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleClearPredefinedVariable(key)}
                    aria-label={`Clear ${key.replace(/_/g, ' ')}`}
                  >
                    Clear
                  </Button>
                </InputGroup>
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
                onChange={(e) => {
                  // console.log('[Input onChange] newCustomKeyName changing from:', newCustomKeyName, 'to:', e.target.value);
                  setNewCustomKeyName(e.target.value);
                }} 
              />
            </Col>
            <Col xs={12} sm={6}>
                <Button variant="outline-success" onClick={handleAddVariable} size="sm">Add Custom Variable</Button>
            </Col>
          </Row>

          <h6 className="mt-4">AI Tools</h6>
          <Row className="mt-3 mb-3 align-items-center">
            <Col xs={12} sm={8} className="mb-2 mb-sm-0">
              <Form.Control
                type="text"
                placeholder="Enter your prompt for AI tools"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Button variant="outline-primary" onClick={handleGenerate}>Generate</Button>
            </Col>
          </Row>

          {aiResult && (
            <div className="mt-3">
              <h5>AI Generated Content</h5>
              <ReactMarkdown>{aiResult.mdContent}</ReactMarkdown>
            </div>
          )}

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
