import React, { useState } from 'react';
import { uploadFile } from '../api'; // Import the uploadFile API function

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage(''); // Clear previous messages
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a file first!');
            return;
        }

        setIsUploading(true);
        setMessage('Uploading...');

        try {
            const response = await uploadFile(selectedFile);
            if (response.success) {
                setMessage(`File uploaded successfully! File ID: ${response.data.file_id}`);
                setSelectedFile(null); // Clear selected file after successful upload
            } else {
                setMessage(`Upload failed: ${response.error || response.message}`);
            }
        } catch (error) {
            setMessage(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Upload File (Teacher/Admin Only)</h3>
            <input type="file" onChange={handleFileChange} disabled={isUploading} />
            <button onClick={handleUpload} disabled={!selectedFile || isUploading} style={{ marginLeft: '10px' }}>
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            {message && <p style={{ marginTop: '10px', color: message.includes('failed') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default FileUpload;
