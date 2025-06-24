import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Save a user's chat message and bot response to Firestore
 * @param userId - The unique ID of the authenticated user
 * @param prompt - The message or query entered by the user
 * @param response - The bot's response
 */
export const saveUserHistory = async (userId: string, prompt: string, response: string) => {
  try {
    if (!userId || !prompt) {
      console.warn("User ID or prompt missing. History not saved.");
      return;
    }

    await addDoc(collection(db, 'users', userId, 'history'), {
      prompt,
      response,
      timestamp: serverTimestamp()
    });

    console.log("History saved successfully.");
  } catch (error) {
    console.error("Error saving history:", error);
  }
};