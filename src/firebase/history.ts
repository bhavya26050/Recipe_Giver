import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

// ✅ FIX: Add Message interface
interface Message {
  from: 'user' | 'bot';
  text: string;
  id: number;
}

/**
 * Save or update a conversation in Firestore
 * @param userId - The unique ID of the authenticated user
 * @param messages - Array of all messages in the current conversation
 * @param conversationId - Optional ID to update existing conversation
 */
export const saveConversation = async (
  userId: string,
  messages: Message[],
  conversationId?: string
): Promise<string> => {
  try {
    const title = messages.length > 0 ? 
      messages.find(m => m.from === 'user')?.text.slice(0, 50) + '...' || 'New Chat' : 
      'New Chat';
    
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : '';
    
    const conversationData: any = {  // ✅ FIX: Use 'any' type to allow dynamic properties
      title,
      messages: messages.map(msg => ({
        from: msg.from,
        text: msg.text,
        timestamp: new Date()
      })),
      lastMessage,
      lastUpdated: serverTimestamp(),
      messageCount: messages.length
    };

    if (conversationId) {
      // Update existing conversation
      const docRef = doc(db, 'users', userId, 'conversations', conversationId);
      await updateDoc(docRef, conversationData);
      console.log("✅ Conversation updated successfully");
      return conversationId;
    } else {
      // Create new conversation
      conversationData.createdAt = serverTimestamp();  // ✅ Now this works because we used 'any'
      const docRef = await addDoc(collection(db, 'users', userId, 'conversations'), conversationData);
      console.log("✅ New conversation saved successfully");
      return docRef.id;
    }
  } catch (error) {
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
    
    const messages: Message[] = [
      { from: 'user', text: prompt, id: Date.now() },
      { from: 'bot', text: response, id: Date.now() + 1 }
    ];
    
    return await saveConversation(userId, messages);
  } catch (error: any) {
    console.error("❌ Error in legacy saveUserHistory:", error);
    throw error;
  }
};