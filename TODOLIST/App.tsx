// App.tsx
//
// Entry point. Sets up:
//   - Notification handler (so alerts show when fired)
//   - TodoProvider (holds tasks_list state, persistence, AI, notifications)
//   - Bottom tab navigation: Tasks | Recycle Bin | Settings
//   - Inside the Tasks tab, a stack navigator for Home / AddTask / EditTask

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { TodoProvider } from './src/context/TodoContext';
import { setupNotificationHandler, requestNotificationPermissions } from './src/lib/notifications';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddTaskScreen } from './src/screens/AddTaskScreen';
import { EditTaskScreen } from './src/screens/EditTaskScreen';
import { RecycleBinScreen } from './src/screens/RecycleBinScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tasks tab: Home -> AddTask / EditTask
function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{ title: 'Add Task', headerShown: true, headerTintColor: '#6C63FF' }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ title: 'Edit Task', headerShown: true, headerTintColor: '#6C63FF' }}
      />
    </Stack.Navigator>
  );
}

function AppInner() {
  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
          tabBarStyle: { paddingBottom: 4, paddingTop: 4 },
        }}
      >
        <Tab.Screen name="TasksTab" component={TasksStack} options={{ tabBarLabel: 'Tasks' }} />
        <Tab.Screen name="RecycleBin" component={RecycleBinScreen} options={{ tabBarLabel: 'Recycle Bin' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TodoProvider>
        <AppInner />
      </TodoProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
