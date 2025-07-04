import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Save or update a conversation in Firestore
 * @param userId - The unique ID of the authenticated user
 * @param messages - Array of all messages in the current conversation
 * @param conversationId - Optional ID to update existing conversation
 */
export const saveConversation = async (
  userId: string,
  messages: Array<{from: string, text: string, id: number}>,
  conversationId?: string
) => {
  try {
    if (!userId || !messages || messages.length === 0) {
      console.warn("Missing required data for conversation save:", { 
        userId: !!userId, 
        messages: messages?.length || 0 
      });
      return null;
    }

    // Filter out system messages and get user/bot pairs
    const conversationMessages = messages.filter(msg => 
      msg.from === 'user' || msg.from === 'bot'
    );

    if (conversationMessages.length === 0) {
      console.warn("No valid messages to save");
      return null;
    }

    // Get the first user message as the conversation title
    const firstUserMessage = conversationMessages.find(msg => msg.from === 'user');
    const title = firstUserMessage ? 
      (firstUserMessage.text.substring(0, 40) + (firstUserMessage.text.length > 40 ? '...' : '')) :
      'Untitled Conversation';

    const conversationData = {
      title,
      messages: conversationMessages.map(msg => ({
        from: msg.from,
        text: msg.text,
        timestamp: new Date()
      })),
      lastMessage: conversationMessages[conversationMessages.length - 1]?.text || '',
      lastUpdated: serverTimestamp(),
      messageCount: conversationMessages.length
    };

    if (conversationId) {
      // Update existing conversation
      const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
      await updateDoc(conversationRef, conversationData);
      console.log("✅ Conversation updated successfully");
      return conversationId;
    } else {
      // Create new conversation
      conversationData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'users', userId, 'conversations'), conversationData);
      console.log("✅ New conversation saved successfully");
      return docRef.id;
    }
  } catch (error: any) {
    console.error("❌ Error saving conversation:", error);
    throw error;
  }
};

/**
 * Legacy function for backward compatibility - now saves as conversation
 */
export const saveUserHistory = async (
  userId: string,
  prompt: string,
  response: string
) => {
  try {
    console.log("⚠️ saveUserHistory is deprecated, use saveConversation instead");
    
    const messages = [
      { from: 'user', text: prompt, id: Date.now() },
      { from: 'bot', text: response, id: Date.now() + 1 }
    ];
    
    return await saveConversation(userId, messages);
  } catch (error: any) {
    console.error("❌ Error in legacy saveUserHistory:", error);
    throw error;
  }
};