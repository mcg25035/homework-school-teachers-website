import React, { useState } from 'react';
import MdEditor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown'; // Used by MdEditor for rendering, also can be used standalone
import 'react-markdown-editor-lite/lib/index.css'; // Default styling for the editor
import { Container, Card, Button, Collapse, Alert } from 'react-bootstrap';

// Basic Markdown Cheatsheet Content
const markdownCheatsheet = `
#### Markdown Cheatsheet

**Headers:**
# H1
## H2
### H3

**Emphasis:**
*italic* or _italic_
**bold** or __bold__
***bold italic*** or ___bold italic___

**Lists:**
**Unordered**
- Item 1
- Item 2
  - Sub-item

**Ordered**
1. First item
2. Second item

**Links:**
[Link text](https://www.example.com)

**Images:**
![Alt text](https://via.placeholder.com/150)

**Code:**
Inline \`code\`
\`\`\`
// Code block
function greet() {
  console.log("Hello!");
}
\`\`\`

**Blockquotes:**
> This is a blockquote.

**Horizontal Rule:**
---
`;

function TeacherPersonalPageEditor({ user }) { // user prop might be used later for saving
  const [markdownContent, setMarkdownContent] = useState(
    `# Welcome to Your Personal Page!

This is some initial **Markdown** content. You can edit it freely.

- List item 1
- List item 2

[Learn more about Markdown!](https://www.markdownguide.org)`
  );
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const handleEditorChange = ({ text }) => {
    setMarkdownContent(text);
  };

  const handleSave = () => {
    console.log('Saving content for user:', user ? user.user_id : 'Unknown user');
    console.log('Markdown Content:', markdownContent);
    // In a real app, this would make an API call:
    // await saveTeacherPageApi({ userId: user.user_id, content: markdownContent });
    alert('Content logged to console! (No backend integration yet)');
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
                <Alert variant="light" style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                  {markdownCheatsheet}
                </Alert>
              </div>
            </Collapse>
          </div>

          <MdEditor
            value={markdownContent}
            style={{ height: '500px' }} // Or other desired height
            onChange={handleEditorChange}
            renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>} // Use ReactMarkdown for preview
            config={{
              view: {
                menu: true, // Show view menu (MD, HTML, Fullscreen)
                md: true,   // Show MD editor panel
                html: true, // Show HTML preview panel
              },
              canView: {
                menu: true,
                md: true,
                html: true,
                fullScreen: true,
                hideMenu: true,
              }
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
