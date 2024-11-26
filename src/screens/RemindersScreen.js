import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { remindersAPI } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium',
    completed: false
  });

  const { token } = useAuth();

  const fetchReminders = async () => {
    try {
      const data = await remindersAPI.getAll();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReminders();
    }
  }, [token]);

  const handleSubmit = async () => {
    try {
      const reminderData = {
        ...formData,
        dueDate: formData.dueDate.toISOString()
      };

      if (selectedReminder) {
        console.log('Updating reminder:', { reminderId: selectedReminder._id, data: reminderData });
        await remindersAPI.update(selectedReminder._id, reminderData);
      } else {
        await remindersAPI.create(reminderData);
      }

      fetchReminders();
      setModalVisible(false);
      setSelectedReminder(null);
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium',
        completed: false
      });
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save reminder');
    }
  };

  const handleDelete = async (id) => {
    try {
      await remindersAPI.delete(id);
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  const handleEdit = (reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      title: reminder.title || '',
      description: reminder.description || '',
      dueDate: new Date(reminder.dueDate) || new Date(),
      priority: reminder.priority || 'medium',
      completed: reminder.completed || false
    });
    setModalVisible(true);
  };

  const toggleComplete = async (reminder) => {
    try {
      const updatedReminder = {
        ...reminder,
        completed: !reminder.completed
      };
      console.log('Toggling reminder completion:', { reminderId: reminder._id, completed: !reminder.completed });
      await remindersAPI.update(reminder._id, updatedReminder);
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#FF4B4B';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#4CAF50';
      default:
        return '#FFA500';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.reminderItem,
        { borderLeftColor: getPriorityColor(item.priority) },
        item.completed && styles.completedReminder
      ]}
      onPress={() => handleEdit(item)}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleComplete(item)}
      >
        <View style={[styles.checkboxInner, item.completed && styles.checked]} />
      </TouchableOpacity>
      <View style={styles.reminderContent}>
        <Text style={[styles.reminderTitle, item.completed && styles.completedText]}>
          {item.title || 'Untitled Reminder'}
        </Text>
        <Text style={[styles.reminderDescription, item.completed && styles.completedText]}>
          {item.description || ''}
        </Text>
        <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
        <Text style={[styles.priorityTag, { backgroundColor: getPriorityColor(item.priority) }]}>
          {item.priority || 'medium'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dueDate;
    
    // Hide the picker for Android after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
    // Update the form data with the new date/time
    setFormData(prev => ({
      ...prev,
      dueDate: currentDate
    }));
  };

  const showPicker = (currentMode) => {
    if (currentMode === 'date') {
      setShowDatePicker(true);
      setShowTimePicker(false);
    } else {
      setShowDatePicker(false);
      setShowTimePicker(true);
    }
    setMode(currentMode);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedReminder(null);
          setFormData({
            title: '',
            description: '',
            dueDate: new Date(),
            priority: 'medium',
            completed: false
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Reminder</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedReminder ? 'Edit Reminder' : 'Add Reminder'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showPicker('date')}
                >
                  <Text style={styles.buttonText}>📅 {formData.dueDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showPicker('time')}
                >
                  <Text style={styles.buttonText}>🕒 {formData.dueDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </TouchableOpacity>
              </View>

              {(showDatePicker || showTimePicker) && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={formData.dueDate}
                  mode={mode}
                  is24Hour={false}
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.picker}
                />
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
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
  reminderItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 5,
    alignItems: 'center',
  },
  completedReminder: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dueDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  priorityTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 5,
    color: 'white',
    fontSize: 12,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  picker: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RemindersScreen;
