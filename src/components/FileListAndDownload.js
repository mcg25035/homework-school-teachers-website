import React from 'react';
import { useFile, downloadFile } from '../api';
import { Button, Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const FileListAndDownload = ({ fileId }) => { // Accept fileId as prop
    const { file, files, isLoading, isError } = useFile(fileId, null, !fileId); // Fetch specific file or all files

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await downloadFile(fileId);
            if (response.success) {
                const blob = await response.data.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName || `file_${fileId}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                alert('File downloaded successfully!');
            } else {
                alert(`Failed to download file: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            alert(`Error downloading file: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading files...</p>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Error loading files: {isError.message}</Alert>
            </Container>
        );
    }

    const filesToDisplay = fileId ? (file ? [file] : []) : files;

    if (!filesToDisplay || filesToDisplay.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">{fileId ? `File with ID ${fileId} not found.` : 'No files available for download.'}</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <h2>{fileId ? `File Details for ID: ${fileId}` : 'Available Files for Download'}</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {filesToDisplay.map((file) => (
                    <Col key={file.file_id}>
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title>{file.filename || `File ID: ${file.file_id}`}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Uploaded by User ID: {file.uploader_user_id}
                                </Card.Subtitle>
                                <Card.Text>
                                    Uploaded: {new Date(file.upload_time).toLocaleString()}
                                </Card.Text>
                                <Button variant="primary" onClick={() => handleDownload(file.file_id, file.filename)}>
                                    Download
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FileListAndDownload;
