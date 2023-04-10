export interface Notification {
  message: string
  timer: NodeJS.Timeout | null
}

export interface NotificationsResult {
  notification: Notification
  addNotification: (type: string) => void
  clearNotification: (type: string) => void
  clearAllNotifications: () => void
}

export const NOTIFICATION_NO_FACE_DETECTED = 'No face detected'
export const NOTIFICATION_INTERFERENCE_WARNING = 'Bad reading, please try again in better conditions'
export const NOTIFICATION_FACE_ORIENT_WARNING = 'Please look straight ahead'
export const NOTIFICATION_FACE_SIZE_WARNING = 'Move closer to camera'
export const NOTIFICATION_BAD_LIGHT_CONDITIONS = 'Increase light on your face'

export const NOTIFICATION_TIMEOUT = 1500
export const NOTIFICATION_PRIORITIZE = [
  NOTIFICATION_NO_FACE_DETECTED,
  NOTIFICATION_FACE_ORIENT_WARNING,
  NOTIFICATION_FACE_SIZE_WARNING,
  NOTIFICATION_BAD_LIGHT_CONDITIONS,
]

export const prioritizeNotifications = (arr: Notification[]) =>
  arr.sort((a, b) =>
    NOTIFICATION_PRIORITIZE.indexOf(a.message) - NOTIFICATION_PRIORITIZE.indexOf(b.message))
