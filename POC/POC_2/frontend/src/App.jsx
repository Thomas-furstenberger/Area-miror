import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotes(data);
      setError('');
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
      setError('');
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Notes</h1>
        <p>Simple and clean note-taking</p>
      </header>

      <div className="form-section">
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <textarea
          placeholder="Note content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea"
        />
        <button onClick={addNote} className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="notes-section">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="empty">No notes yet. Create one!</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <small>{new Date(note.createdAt).toLocaleDateString()}</small>
                <button onClick={() => deleteNote(note.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
