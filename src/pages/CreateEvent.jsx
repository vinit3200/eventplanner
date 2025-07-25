
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import LocationPicker from '../components/LocationPicker';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    locationCoordinates: null,
    category: 'social',
    isPublic: true,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    
    const imageRef = ref(storage, `event-images/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      location: locationData.address,
      locationCoordinates: locationData.coordinates
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const eventData = {
        ...formData,
        imageUrl
      };
      
      const eventId = await createEvent(eventData);
      navigate(`/event/${eventId}`);
    } catch (error) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create New Event</h1>
          <p className="card-subtitle">Bring people together with an amazing event</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your event a catchy title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what makes your event special..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {imagePreview && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={imagePreview} 
                  alt="Event preview" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }} 
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time *</label>
              <input
                type="time"
                name="time"
                className="form-input"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialLocation={formData.location}
          />

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="social">Social</option>
              <option value="business">Business</option>
              <option value="educational">Educational</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports</option>
              <option value="arts">Arts & Culture</option>
              <option value="technology">Technology</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span className="form-label">Make this event public</span>
            </label>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              Public events can be discovered by anyone. Private events are invitation-only.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
