// src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EXPO_PROJECT_ID } from '@env';

export const registerForPushNotificationsAsync = async () => {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  const projectId = EXPO_PROJECT_ID;  
  token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  return token;
};

export const scheduleNotification = async (title, body, date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: {
      date: new Date(date),
    },
  });
};

