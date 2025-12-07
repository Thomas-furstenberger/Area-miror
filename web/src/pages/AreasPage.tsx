import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Area {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  actionService: string;
  actionType: string;
  reactionService: string;
  reactionType: string;
  createdAt: string;
}

export default function AreasPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    actionService: 'gmail',
    actionType: 'email_received',
    reactionService: 'discord',
    reactionType: 'send_message',
    webhookUrl: '',
    message: '',
    // Timer config fields
    timerHour: '12',
    timerMinute: '0',
    timerDate: '',
    timerDayOfWeek: '1',
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/areas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAreas(data.areas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const createArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      setLoading(false);
      return;
    }

    try {
      // Build actionConfig based on service and type
      let actionConfig = {};
      if (formData.actionService === 'timer') {
        if (formData.actionType === 'time_reached') {
          actionConfig = {
            hour: parseInt(formData.timerHour),
            minute: parseInt(formData.timerMinute),
          };
        } else if (formData.actionType === 'date_reached') {
          actionConfig = { date: formData.timerDate };
        } else if (formData.actionType === 'day_of_week') {
          actionConfig = { dayOfWeek: parseInt(formData.timerDayOfWeek) };
        }
      }

      const response = await fetch(`${API_URL}/api/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          actionService: formData.actionService,
          actionType: formData.actionType,
          actionConfig,
          reactionService: formData.reactionService,
          reactionType: formData.reactionType,
          reactionConfig: {
            webhookUrl: formData.webhookUrl,
            message: formData.message,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('AREA created successfully!');
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          actionService: 'gmail',
          actionType: 'email_received',
          reactionService: 'discord',
          reactionType: 'send_message',
          webhookUrl: '',
          message: '',
          timerHour: '12',
          timerMinute: '0',
          timerDate: '',
          timerDayOfWeek: '1',
        });
        fetchAreas();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating area:', error);
      alert('Failed to create AREA');
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/areas/${id}/toggle`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchAreas();
      }
    } catch (error) {
      console.error('Error toggling area:', error);
    }
  };

  const deleteArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AREA?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/areas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchAreas();
      }
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>My AREAs</h1>
        <button
          onClick={() => navigate('/areas/create')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#474973',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          + Créer une AREA
        </button>
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Create New AREA</h2>
          <form onSubmit={createArea}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="My Gmail to Discord automation"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="When I receive an email, send a Discord message"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#6366f1' }}>
                  IF (Action)
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Service
                  </label>
                  <select
                    value={formData.actionService}
                    onChange={(e) => setFormData({ ...formData, actionService: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="timer">Timer</option>
                    <option value="github">GitHub</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Action Type
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {formData.actionService === 'gmail' && (
                      <>
                        <option value="email_received">Email Received</option>
                        <option value="email_with_attachment">Email with Attachment</option>
                      </>
                    )}
                    {formData.actionService === 'timer' && (
                      <>
                        <option value="time_reached">Time Reached</option>
                        <option value="date_reached">Date Reached</option>
                        <option value="day_of_week">Day of Week</option>
                      </>
                    )}
                    {formData.actionService === 'github' && (
                      <>
                        <option value="issue_created">Issue Created</option>
                        <option value="pull_request_opened">Pull Request Opened</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#10b981' }}>
                  THEN (Reaction)
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Service
                  </label>
                  <select
                    value={formData.reactionService}
                    onChange={(e) => setFormData({ ...formData, reactionService: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="discord">Discord</option>
                    <option value="gmail">Gmail</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Reaction Type
                  </label>
                  <select
                    value={formData.reactionType}
                    onChange={(e) => setFormData({ ...formData, reactionType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="send_message">Send Message</option>
                    <option value="send_email">Send Email</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.actionService === 'timer' && (
              <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#6366f1' }}>Action Configuration</h3>

                {formData.actionType === 'time_reached' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Hour (0-23) *</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formData.timerHour}
                        onChange={(e) => setFormData({ ...formData, timerHour: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Minute (0-59) *</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.timerMinute}
                        onChange={(e) => setFormData({ ...formData, timerMinute: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {formData.actionType === 'date_reached' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Date *</label>
                    <input
                      type="date"
                      value={formData.timerDate}
                      onChange={(e) => setFormData({ ...formData, timerDate: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}

                {formData.actionType === 'day_of_week' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Day of Week *</label>
                    <select
                      value={formData.timerDayOfWeek}
                      onChange={(e) => setFormData({ ...formData, timerDayOfWeek: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Reaction Configuration</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Discord Webhook URL *
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  required
                  placeholder="https://discord.com/api/webhooks/..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Message
                </label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="New email received!"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 32px',
                backgroundColor: loading ? '#9ca3af' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                width: '100%',
              }}
            >
              {loading ? 'Creating...' : 'Create AREA'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {areas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <p style={{ fontSize: '18px' }}>No AREAs yet. Create your first automation!</p>
          </div>
        ) : (
          areas.map((area) => (
            <div
              key={area.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{area.name}</h3>
                  <span
                    style={{
                      padding: '4px 12px',
                      backgroundColor: area.active ? '#d1fae5' : '#fee2e2',
                      color: area.active ? '#065f46' : '#991b1b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {area.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {area.description && (
                  <p style={{ color: '#6b7280', marginBottom: '12px' }}>{area.description}</p>
                )}
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#4b5563' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#6366f1' }}>IF:</span>{' '}
                    {area.actionService} - {area.actionType}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>THEN:</span>{' '}
                    {area.reactionService} - {area.reactionType}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => toggleArea(area.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: area.active ? '#fbbf24' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {area.active ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteArea(area.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
