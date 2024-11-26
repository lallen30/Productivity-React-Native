import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TodosScreen from './src/screens/TodosScreen';
import NotesScreen from './src/screens/NotesScreen';
import EventsScreen from './src/screens/EventsScreen';
import RemindersScreen from './src/screens/RemindersScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator>
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              headerShown: true,
              title: 'Dashboard'
            }}
          />
          <Stack.Screen 
            name="TodosScreen" 
            component={TodosScreen}
            options={{ title: 'Todos' }}
          />
          <Stack.Screen 
            name="NotesScreen" 
            component={NotesScreen}
            options={{ title: 'Notes' }}
          />
          <Stack.Screen 
            name="EventsScreen" 
            component={EventsScreen}
            options={{ title: 'Events' }}
          />
          <Stack.Screen 
            name="RemindersScreen" 
            component={RemindersScreen}
            options={{ title: 'Reminders' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
