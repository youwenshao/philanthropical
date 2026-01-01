/**
 * Push notification utilities
 * Note: Requires expo-notifications package
 */

import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    throw new Error("Notification permission not granted");
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null, // null means show immediately
  });
}

/**
 * Cancel a notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification token for push notifications
 */
export async function getNotificationToken(): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });
    return token.data;
  } catch (error) {
    console.error("Failed to get notification token:", error);
    return null;
  }
}

