import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Todos',
      description: 'Manage your tasks and to-dos',
      screen: 'TodosScreen',
      icon: '📝'
    },
    {
      title: 'Notes',
      description: 'Create and organize your notes',
      screen: 'NotesScreen',
      icon: '📔'
    },
    {
      title: 'Events',
      description: 'Schedule and track your events',
      screen: 'EventsScreen',
      icon: '📅'
    },
    {
      title: 'Reminders',
      description: 'Set and manage your reminders',
      screen: 'RemindersScreen',
      icon: '⏰'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={styles.subtitle}>Your productivity dashboard</Text>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
