import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const API_URL = 'http://localhost:3000/api/notes';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  const addNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required');
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
      Alert.alert('Success', 'Note created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create note');
      console.error(error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setNotes(notes.filter((n) => n.id !== id));
      Alert.alert('Success', 'Note deleted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note');
      console.error(error);
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
      <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', onPress: () => {} },
            { text: 'Delete', onPress: () => deleteNote(item.id), style: 'destructive' },
          ])
        }
      >
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Notes App</Text>
        <Text style={styles.headerSubtitle}>Simple note-taking</Text>
      </View>

      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Note title..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Note content..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addNote} disabled={loading}>
          <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Add Note'}</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No notes yet. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.notesList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  formSection: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'System',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addBtn: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  notesList: {
    padding: 10,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
