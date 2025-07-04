import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Save a user's entire chat (all messages) to Firestore
 * @param userId - The unique ID of the authenticated user
 * @param title - The title for the chat
 * @param messages - The full array of messages for this chat
 */
export const saveUserHistory = async (
  userId: string,
  title: string,
  messages: any[]
) => {
  try {
    // Debug: Log all inputs and check authentication
    console.log("saveUserHistory called with:", { userId, title, messages });

    if (!userId || !messages || messages.length === 0) {
      console.warn("User ID or messages missing. History not saved.");
      return;
    }

    // Attempt to write to Firestore
    await addDoc(collection(db, 'users', userId, 'history'), {
      title,
      messages,
      timestamp: serverTimestamp()
    });

    console.log("History saved successfully.");
  } catch (error: any) {
    // Log the error code and message for better debugging
    console.error("Error saving history:", error?.code, error?.message, error);
  }
};