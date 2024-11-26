import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { eventsAPI } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    priority: 'medium'
  });

  const { token } = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const handleSubmit = async () => {
    try {
      const eventData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      };

      console.log('Submitting event data:', eventData);

      if (selectedEvent) {
        console.log('Updating event:', { eventId: selectedEvent._id, data: eventData });
        await eventsAPI.update(selectedEvent._id, eventData);
      } else {
        console.log('Creating new event:', eventData);
        await eventsAPI.create(eventData);
      }

      fetchEvents();
      setModalVisible(false);
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      startDate: new Date(event.startDate) || new Date(),
      endDate: new Date(event.endDate) || new Date(),
      location: event.location || '',
      priority: event.priority || 'medium'
    });
    setModalVisible(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventItem, { borderLeftColor: getPriorityColor(item.priority) }]}
      onPress={() => handleEdit(item)}
    >
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title || 'Untitled Event'}</Text>
        <Text style={styles.eventDescription}>{item.description || ''}</Text>
        <Text style={styles.eventTime}>
          Start: {formatDate(item.startDate)}
        </Text>
        <Text style={styles.eventTime}>
          End: {formatDate(item.endDate)}
        </Text>
        {item.location && (
          <Text style={styles.eventLocation}> {item.location}</Text>
        )}
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

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedEvent(null);
          setFormData({
            title: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            location: '',
            priority: 'medium'
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Event</Text>
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
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
            <View style={styles.priorityContainer}>
              <Text style={styles.label}>Priority:</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      formData.priority === priority && styles.selectedPriority,
                      { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setFormData({ ...formData, priority: priority })}
                  >
                    <Text style={styles.priorityButtonText}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>Start: {formatDate(formData.startDate)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date(formData.startDate)}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) {
                    setFormData({ ...formData, startDate: date });
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>End: {formatDate(formData.endDate)}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={new Date(formData.endDate)}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) {
                    setFormData({ ...formData, endDate: date });
                  }
                }}
              />
            )}
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
  eventItem: {
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
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  priorityContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    margin: 4,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedPriority: {
    borderWidth: 2,
    borderColor: '#000',
  },
  priorityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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

export default EventsScreen;
