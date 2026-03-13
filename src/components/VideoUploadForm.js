import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function VideoUploadForm({ onUploadSuccess }) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(50);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else if (file) {
      alert('Please select a valid image file (JPG, PNG, GIF)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      setMessage('Please select a video file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('isPublic', 'true');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://video-platform2-api.onrender.com';
      
      // 🔍 ADDED DETAILED DEBUG LOGGING RIGHT BEFORE FETCH
      console.log('\n========== FRONTEND UPLOAD DEBUG ==========');
      console.log('1. FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'thumbnail' && pair[1] instanceof File) {
          console.log(`   thumbnail: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
        } else if (pair[0] === 'video') {
          console.log(`   video: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
        } else {
          console.log(`   ${pair[0]}: ${pair[1]}`);
        }
      }
      console.log('2. Token present:', !!getToken());
      console.log('3. Token preview:', getToken() ? getToken().substring(0, 20) + '...' : 'No token');
      console.log('4. API URL:', API_URL);
      console.log('5. Full request URL:', `${API_URL}/api/upload/video-with-thumbnail`);
      console.log('==========================================\n');

      const response = await fetch(`${API_URL}/api/upload/video-with-thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        setMessage('✅ Video uploaded successfully!');
        setTitle('');
        setDescription('');
        setPrice(50);
        setVideoFile(null);
        setThumbnailFile(null);
        document.getElementById('video-input').value = '';
        document.getElementById('thumbnail-input').value = '';
        if (onUploadSuccess) onUploadSuccess(data.video);
      } else {
        setMessage(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form" style={{ background: '#fff', padding: '20px', borderRadius: '8px', color: '#333' }}>
      <h2>Upload New Video</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Video Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter video title"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Enter video description"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (KSh) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min="1"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Video File *</label>
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            required
            style={{ width: '100%' }}
          />
          {videoFile && (
            <small>Selected: {videoFile.name} ({(videoFile.size / (1024*1024)).toFixed(2)} MB)</small>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Thumbnail Image (Optional)</label>
          <input
            id="thumbnail-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleThumbnailChange}
            style={{ width: '100%' }}
          />
          {thumbnailFile && <small>Selected: {thumbnailFile.name}</small>}
        </div>

        <button 
          type="submit" 
          disabled={uploading} 
          style={{
            background: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>

        {message && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default VideoUploadForm;