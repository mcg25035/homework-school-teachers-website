import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  Button,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
  ListGroup,
  ButtonGroup
} from 'react-bootstrap';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

import { useLoginStatus } from '../api';
import { useTeacherPage, updateTeacherPage } from '../api';
import { useTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api'; // Assuming these are exported from api.js

const mdParser = new MarkdownIt();

function TeacherTemplateManager() {
  const { user, isLoggedIn, isLoading: isLoadingLoginStatus } = useLoginStatus();

  // State for teacher's current page content
  const { data: teacherPageData, isLoading: isLoadingTeacherPage, isError: isErrorTeacherPage, mutate: revalidateTeacherPage } = useTeacherPage(user?.user_id);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [currentTeacherVariables, setCurrentTeacherVariables] = useState({});


  useEffect(() => {
    if (teacherPageData?.content) {
      setCurrentMarkdownContent(teacherPageData.content);
    }
    if (teacherPageData?.variables) {
      setCurrentTeacherVariables(teacherPageData.variables || {});
    }
  }, [teacherPageData]);

  // Fetching user's own templates
  const {
    templates: myTemplatesData,
    isLoading: isLoadingMyTemplates,
    isError: errorMyTemplates,
    // mutate: revalidateMyTemplates // SWR should auto-revalidate via performMutation updates
  } = useTemplates(isLoggedIn && user?.user_id ? { creator_id: user.user_id } : {});

  // Fetching shared templates
  const {
    templates: sharedTemplatesData,
    isLoading: isLoadingSharedTemplates,
    isError: errorSharedTemplates,
    // mutate: revalidateSharedTemplates // SWR should auto-revalidate
  } = useTemplates(isLoggedIn ? { shared: true } : {});

  console.log('[TeacherTemplateManager] Raw sharedTemplatesData from useTemplates:', sharedTemplatesData);
  console.log('[TeacherTemplateManager] isLoadingSharedTemplates:', isLoadingSharedTemplates);
  console.log('[TeacherTemplateManager] errorSharedTemplates:', errorSharedTemplates);

  // Filter out own templates from shared templates
  const filteredSharedTemplates = React.useMemo(() => {
    console.log('[TeacherTemplateManager useMemo] Calculating filteredSharedTemplates. sharedTemplatesData:', sharedTemplatesData, 'user.user_id:', user?.user_id);
    if (!sharedTemplatesData || !user?.user_id) {
      console.log('[TeacherTemplateManager useMemo] Guard hit (sharedTemplatesData or user_id missing), returning [].');
      return [];
    }
    const result = sharedTemplatesData.filter(t => {
      const condition = t.creator_id !== user.user_id;
      console.log(`[TeacherTemplateManager useMemo filter] Template ID: ${t.template_id}, t.creator_id: ${t.creator_id} (type: ${typeof t.creator_id}), user.user_id: ${user.user_id} (type: ${typeof user.user_id}), condition (t.creator_id !== user.user_id): ${condition}`);
      return condition;
    });
    console.log('[TeacherTemplateManager useMemo] Filter result:', result);
    return result;
  }, [sharedTemplatesData, user?.user_id]);


  // Create/Edit Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateIsShared, setNewTemplateIsShared] = useState(false);
  const [sourceForCreateModal, setSourceForCreateModal] = useState('blank'); // 'current' or 'blank'
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // General messages and errors
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);


  const handleShowCreateModal = (source = 'blank') => {
    setSourceForCreateModal(source);
    if (source === 'current') {
      setNewTemplateName(`Copy of ${user?.username}'s Page ${new Date().toLocaleDateString()}`);
      setNewTemplateContent(currentMarkdownContent);
      setNewTemplateIsShared(false); // Default to not shared
    } else {
      setNewTemplateName('');
      setNewTemplateContent('');
      setNewTemplateIsShared(false);
    }
    setShowCreateModal(true);
    setMessage(null);
    setError(null);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateIsShared(false);
    setIsSavingTemplate(false);
  };

  const handleSaveNewTemplate = async () => {
    if (!newTemplateName.trim()) {
      setError("Template name cannot be empty.");
      return;
    }
    if (!user?.user_id) {
        setError("You must be logged in to create a template.");
        return;
    }

    setIsSavingTemplate(true);
    setError(null);
    setMessage(null);

    const templateData = {
      name: newTemplateName,
      content: newTemplateContent,
      is_shared: newTemplateIsShared,
      creator_id: user.user_id, // Make sure creator_id is included
    };

    try {
      const result = await createTemplate(templateData);
      if (result.success) {
        setMessage("Template created successfully!");
        // SWR will auto-revalidate lists due to changes in api.js's performMutation
        // No need to call revalidateMyTemplates() explicitly if that's working
        handleCloseCreateModal();
      } else {
        setError(result.error || "Failed to create template.");
      }
    } catch (e) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleApplyTemplate = async (templateContent) => {
    if (!user?.user_id) {
      setError("You must be logged in to apply a template.");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      // Use current variables from teacher's page, or empty object if none
      const result = await updateTeacherPage(user.user_id, templateContent, currentTeacherVariables);
      if (result.success) {
        setMessage("Template applied to your page successfully! Your page will now reload.");
        revalidateTeacherPage(); // Re-fetch teacher page data to reflect changes
        // Optionally, force a page reload if components don't auto-update smoothly
        // setTimeout(() => window.location.reload(), 2000);
      } else {
        setError(result.error || "Failed to apply template.");
      }
    } catch (e) {
      setError(e.message || "An error occurred while applying the template.");
    }
  };

  const handleToggleShare = async (template) => {
    setError(null);
    setMessage(null);
    const updatedTemplateData = {
      ...template, // Send all existing data
      is_shared: !template.is_shared,
    };
    // Remove fields that shouldn't be sent on update or that API might reject if unchanged by user
    delete updatedTemplateData.template_id;
    delete updatedTemplateData.creator_id;
    delete updatedTemplateData.created_at;
    delete updatedTemplateData.updated_at;


    try {
      const result = await updateTemplate(template.template_id, {
        name: template.name, // Keep original name unless editing
        content: template.content, // Keep original content unless editing
        is_shared: !template.is_shared
      });
      if (result.success) {
        setMessage(`Template ${template.name} is now ${!template.is_shared ? 'shared' : 'private'}.`);
        // SWR should revalidate automatically
      } else {
        setError(result.error || "Failed to update template share status.");
      }
    } catch (e) {
      setError(e.message || "An error occurred while updating share status.");
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!window.confirm(`Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`)) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      // Pass creatorId if available and if your deleteTemplate API expects it for revalidation hint
      const result = await deleteTemplate(templateId, user?.user_id);
      if (result.success) {
        setMessage(`Template "${templateName}" deleted successfully.`);
        // SWR should revalidate automatically
      } else {
        setError(result.error || "Failed to delete template.");
      }
    } catch (e) {
      setError(e.message || "An error occurred while deleting the template.");
    }
  };


  if (isLoadingLoginStatus) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (!isLoggedIn || !user) {
    return <Container className="mt-5"><Alert variant="warning">Please log in to manage templates.</Alert></Container>;
  }

  return (
    <Container fluid className="py-3">
      <Card>
        <Card.Header as="h2">Template Manager</Card.Header>
        <Card.Body>
          {message && <Alert variant="success" onClose={() => setMessage(null)} dismissible>{message}</Alert>}
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

          <Row className="mb-3">
            <Col>
              <Button variant="primary" onClick={() => handleShowCreateModal('blank')}>
                Create New Blank Template
              </Button>
            </Col>
            <Col>
              <Button variant="secondary" onClick={() => handleShowCreateModal('current')} disabled={isLoadingTeacherPage}>
                {isLoadingTeacherPage ? <Spinner as="span" animation="border" size="sm" /> : 'Create Template from My Current Page'}
              </Button>
            </Col>
          </Row>

          <Tabs defaultActiveKey="my-templates" id="template-manager-tabs" className="mb-3">
            <Tab eventKey="my-templates" title="My Templates">
              {isLoadingMyTemplates && <div className="text-center p-3"><Spinner animation="border" /></div>}
              {errorMyTemplates && <Alert variant="danger">Error loading your templates: {errorMyTemplates.message}</Alert>}
              {!isLoadingMyTemplates && !errorMyTemplates && (
                myTemplatesData && myTemplatesData.length > 0 ? (
                  <ListGroup>
                    {myTemplatesData.map(template => (
                      <ListGroup.Item key={template.template_id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{template.name}</strong>
                          <small className="d-block text-muted">
                            Shared: {template.is_shared ? 'Yes' : 'No'} |
                            Last updated: {new Date(template.updated_at).toLocaleDateString()}
                          </small>
                        </div>
                        <ButtonGroup>
                          <Button variant="outline-primary" size="sm" onClick={() => handleApplyTemplate(template.content)}>Apply to My Page</Button>
                          <Button variant={template.is_shared ? "outline-warning" : "outline-success"} size="sm" onClick={() => handleToggleShare(template)}>
                            {template.is_shared ? 'Unshare' : 'Share'}
                          </Button>
                          {/* Edit button can be added here */}
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTemplate(template.template_id, template.name)}>Delete</Button>
                        </ButtonGroup>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="info">You haven't created any templates yet.</Alert>
                )
              )}
            </Tab>

            <Tab eventKey="shared-templates" title="Shared Templates">
              {isLoadingSharedTemplates && <div className="text-center p-3"><Spinner animation="border" /></div>}
              {errorSharedTemplates && <Alert variant="danger">Error loading shared templates: {errorSharedTemplates.message}</Alert>}
              {!isLoadingSharedTemplates && !errorSharedTemplates &&
                (() => { // Use a function to allow logging before returning JSX
                  console.log('[TeacherTemplateManager Render] filteredSharedTemplates:', filteredSharedTemplates);
                  console.log('[TeacherTemplateManager Render] Condition (filteredSharedTemplates && filteredSharedTemplates.length > 0):', filteredSharedTemplates && filteredSharedTemplates.length > 0);
                  return filteredSharedTemplates && filteredSharedTemplates.length > 0 ? (
                    <ListGroup>
                      {filteredSharedTemplates.map(template => (
                        <ListGroup.Item key={template.template_id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{template.name}</strong>
                            <small className="d-block text-muted">
                              Creator ID: {template.creator_id} |
                              Last updated: {new Date(template.updated_at).toLocaleDateString()}
                            </small>
                          </div>
                          <ButtonGroup>
                            {/* Preview Modal can be added here */}
                            <Button variant="outline-primary" size="sm" onClick={() => handleApplyTemplate(template.content)}>Use This Template</Button>
                          </ButtonGroup>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">No templates are currently shared by other users (after filtering).</Alert>
                  );
                })()}
            </Tab>
          </Tabs>

          {/* Create/Edit Template Modal */}
          <Modal show={showCreateModal} onHide={handleCloseCreateModal} size="lg" backdrop="static">
            <Modal.Header closeButton>
              <Modal.Title>
                {sourceForCreateModal === 'edit' ? 'Edit Template' : 'Create New Template'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Template Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Template Content (Markdown)</Form.Label>
                  <MdEditor
                    value={newTemplateContent}
                    style={{ height: '400px' }}
                    renderHTML={text => mdParser.render(text)}
                    onChange={({ text }) => setNewTemplateContent(text)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Share this template with other users"
                    checked={newTemplateIsShared}
                    onChange={(e) => setNewTemplateIsShared(e.target.checked)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseCreateModal} disabled={isSavingTemplate}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveNewTemplate} disabled={isSavingTemplate}>
                {isSavingTemplate ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : 'Save Template'}
              </Button>
            </Modal.Footer>
          </Modal>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeacherTemplateManager;
