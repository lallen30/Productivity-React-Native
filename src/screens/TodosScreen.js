import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { todosAPI } from '../api/apiService';

const TodosScreen = () => {
  const [todos, setTodos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium',
    status: 'pending'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mode, setMode] = useState('date');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await todosAPI.getAll();
      setTodos(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch todos');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTodo) {
        await todosAPI.update(editingTodo._id, formData);
      } else {
        await todosAPI.create(formData);
      }
      setModalVisible(false);
      setEditingTodo(null);
      resetForm();
      fetchTodos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await todosAPI.delete(id);
      fetchTodos();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate || new Date(),
      priority: todo.priority || 'medium',
      status: todo.status || 'pending'
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'medium',
      status: 'pending'
    });
  };

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.todoDescription}>{item.description}</Text>
        <View style={styles.todoMeta}>
          <Text style={[styles.todoPriority, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
          <Text style={styles.todoStatus}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.todoActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFB347';
      case 'low': return '#77DD77';
      default: return '#666';
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dueDate;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    
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

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d instanceof Date && !isNaN(d) ? d.toLocaleString() : '';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setEditingTodo(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add New Todo</Text>
      </TouchableOpacity>

      <FlatList
        data={todos}
        renderItem={renderTodoItem}
        keyExtractor={item => item._id}
        style={styles.list}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTodo ? 'Edit Todo' : 'New Todo'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showPicker('date')}
                >
                  <Text style={styles.buttonText}>📅 {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Select Date'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => showPicker('time')}
                >
                  <Text style={styles.buttonText}>🕒 {formData.dueDate ? new Date(formData.dueDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 'Select Time'}</Text>
                </TouchableOpacity>
              </View>

              {(showDatePicker || showTimePicker) && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={formData.dueDate instanceof Date ? formData.dueDate : new Date()}
                  mode={mode}
                  is24Hour={false}
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.picker}
                />
              )}
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Priority:</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority && styles.priorityButtonSelected,
                      { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setFormData({...formData, priority})}
                  >
                    <Text style={styles.priorityButtonText}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Status:</Text>
              <View style={styles.statusButtons}>
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonSelected
                    ]}
                    onPress={() => setFormData({...formData, status})}
                  >
                    <Text style={styles.statusButtonText}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + 
                       status.replace('_', ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingTodo(null);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonText}>
                  {editingTodo ? 'Update' : 'Create'}
                </Text>
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
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  todoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  todoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  todoPriority: {
    fontSize: 12,
    fontWeight: '500',
  },
  todoStatus: {
    fontSize: 12,
    color: '#666',
  },
  todoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  priorityButtonSelected: {
    opacity: 0.8,
  },
  priorityButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  statusButtonSelected: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
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
});

export default TodosScreen;
