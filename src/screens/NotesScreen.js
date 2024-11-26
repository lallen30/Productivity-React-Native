import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { notesAPI } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

const NotesScreen = () => {
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    color: '#FFE4B5'
  });

  const { token } = useAuth();

  const fetchNotes = async () => {
    try {
      const data = await notesAPI.getAll();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (selectedNote) {
        console.log('Updating note:', { noteId: selectedNote._id, data });
        await notesAPI.update(selectedNote._id, data);
      } else {
        await notesAPI.create(data);
      }

      fetchNotes();
      setModalVisible(false);
      setSelectedNote(null);
      setFormData({
        title: '',
        content: '',
        tags: '',
        color: '#FFE4B5'
      });
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesAPI.delete(id);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
      color: note.color || '#FFE4B5'
    });
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: item.color || '#FFE4B5' }]}
      onPress={() => handleEdit(item)}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.noteText} numberOfLines={2}>
          {item.content || ''}
        </Text>
        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedNote(null);
          setFormData({
            title: '',
            content: '',
            tags: '',
            color: '#FFE4B5'
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Content"
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 100,
  },
  noteItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#FFE4B5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  deleteButtonText: {
    color: 'red',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotesScreen;
