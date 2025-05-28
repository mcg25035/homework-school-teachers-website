import React, { useState } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';
import { Container, Card, Button, Collapse, Alert } from 'react-bootstrap';

// Basic Markdown Cheatsheet Content - DEFINED WITH BACKTICKS
const markdownCheatsheet = \`
#### Markdown Cheatsheet (Simplified)

**Headers:**
# H1
## H2

**Emphasis:**
*italic*
**bold**

**Lists:**
- Item 1
- Item 2

**Links:**
[Example Link](https://www.example.com)

**Code:**
Inline \\\\\`code\\\\\`
\\\\\\\`\\\\\\\`\\\\\\\`
function test() {
  console.log("hello");
}
\\\\\\\`\\\\\\\`\\\\\\\`
\`; // END OF BACKTICK STRING

function TeacherPersonalPageEditor({ user }) {
  const [markdownContent, setMarkdownContent] = useState(
\`# Welcome!

Edit this page using Markdown.
- Point one
- Point two
\`
  );
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const handleEditorChange = ({ text }) => {
    setMarkdownContent(text);
  };

  const handleSave = () => {
    console.log('Saving content for user:', user ? user.user_id : 'Unknown user');
    console.log('Markdown Content:', markdownContent);
    alert("Content logged to console. No backend integration yet."); // Ensure this line is simple
  };

  return (
    <Container fluid className="mt-3">
      <Card>
        <Card.Header as="h4">Edit Your Personal Page</Card.Header>
        <Card.Body>
          <div className="mb-3">
            <Button
              onClick={() => setShowCheatsheet(!showCheatsheet)}
              aria-controls="markdown-cheatsheet-collapse"
              aria-expanded={showCheatsheet}
              variant="outline-info"
              size="sm"
            >
              {showCheatsheet ? 'Hide' : 'Show'} Markdown Cheatsheet
            </Button>
            <Collapse in={showCheatsheet}>
              <div id="markdown-cheatsheet-collapse" className="mt-2">
                {/* Ensure cheatsheet is rendered correctly */}
                <Alert variant="light" style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                  <pre>{markdownCheatsheet}</pre>
                </Alert>
              </div>
            </Collapse>
          </div>

          <MdEditor
            value={markdownContent}
            style={{ height: '500px' }}
            onChange={handleEditorChange}
            renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
            config={{
              view: { menu: true, md: true, html: true },
              canView: { menu: true, md: true, html: true, fullScreen: true, hideMenu: true }
            }}
          />
          
          <div className="mt-3 text-end">
            <Button variant="primary" onClick={handleSave}>
              Save Page (Log to Console)
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeacherPersonalPageEditor;
