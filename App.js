import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import MainScreen from './components/MainScreen';
import { registerForPushNotificationsAsync } from './services/notificationService';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const prepareApp = async () => {
      await registerForPushNotificationsAsync();
      // Simulate a loading process, like fetching initial data
      setTimeout(() => {
        setIsLoading(false);
      }, 3000); // Adjust the duration as needed
    };

    prepareApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
