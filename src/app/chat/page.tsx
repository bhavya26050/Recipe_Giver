'use client';

import { MouseEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { saveUserHistory } from '@/firebase/history';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle, Send, Trash2, ChefHat, Menu, X, ThumbsUp, ThumbsDown, Clock, 
         PlusCircle, Mic, MicOff, Edit, Check, AlertCircle, BookOpen, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy , deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  type PreviousChat = {
    id: number;
    title: string;
    messages: { from: string; text: string; id: number }[];
  };
  const [previousChats, setPreviousChats] = useState<PreviousChat[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  type SpeechRecognition = typeof window.webkitSpeechRecognition;
  
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Listen for clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebarElement = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      
      if (isSidebarOpen && sidebarElement && 
          !sidebarElement.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    // Initialize speech recognition if browser supports it
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition as any;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: { results: Iterable<unknown> | ArrayLike<unknown>; }) => {
        const transcript = Array.from(event.results)
          .map(result => (result as SpeechRecognitionResult)[0])
          .map(result => (result as SpeechRecognitionAlternative).transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognition.onerror = (event: { error: any; }) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push('/login');
    } else {
      setUserEmail(user.email || '');

      // Fetch chat history from Firestore
      const historyRef = collection(db, 'users', user.uid, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      // Convert Firestore docs to your PreviousChat format
      const chats = querySnapshot.docs.map((doc, idx) => ({
        id: doc.id,
        title: doc.data().prompt?.substring(0, 25) || `Chat ${idx + 1}`,
        messages: [
          { from: 'user', text: doc.data().prompt, id: `${doc.id}-user` },
          { from: 'bot', text: doc.data().response, id: `${doc.id}-bot` }
        ]
      }));

      setPreviousChats(chats);
    }
  });
  return () => unsubscribe();
}, [router]);

  // Update the handleSend function to provide better context
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const messageId = Date.now();
    const userMessage = input;
    
    // Add user message to state first for immediate UI feedback
    setMessages(prev => [...prev, { from: 'user', text: userMessage, id: messageId }]);
    
    // Clear input and show typing indicator
    setInput('');
    setIsTyping(true);
    
    // Focus the input after sending
    inputRef.current?.focus();
    
    try {
      // Prepare conversation history (last 8 messages for better context)
      const conversationHistory = messages
        .slice(-8)  // Increased to 8 for better context
        .map(msg => ({ 
          role: msg.from === 'user' ? 'user' : 'assistant', 
          content: msg.text.replace(/\*.*?\*/g, '').substring(0, 500) // Remove markdown and limit length
        }));
        
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: conversationHistory 
        }),
      });

      setIsTyping(false);
      
      if (!response.ok) {
        // Enhanced error handling
        const errorData = await response.json();
        setMessages(prev => [
          ...prev,
          { 
            from: 'bot', 
            text: `Oops! 😅 I'm having a little trouble right now. But don't worry - I'm still here to help! Try asking again, or let me know if you'd like some quick recipe ideas while I get back on my feet! 🍳`, 
            id: Date.now() 
          }
        ]);
        return;
      }
      
      const data = await response.json();
      let recipeResponse = data.response;
      
      // Add source information to the response if available (with emojis for better UX)
      if (data.source) {
        let sourceInfo = "";
        if (data.source === "database") {
          sourceInfo = "\n\n---\n📚 *Recipe from our curated database*";
        } else if (data.source === "api") {
          sourceInfo = "\n\n---\n🤖 *Recipe created by AI based on your request*";
        } else if (data.source === "fallback") {
          sourceInfo = "\n\n---\n📖 *Recipe from our backup collection*";
        }
        // Don't add source info for conversational responses
        if (data.source !== "conversation") {
          recipeResponse += sourceInfo;
        }
      }
      
      // Add the bot's response to the messages
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: recipeResponse, id: Date.now() }
      ]);
      
      // Save to history if it was a recipe request (not just casual conversation)
      const user = auth.currentUser;
      if (user && userMessage && typeof recipeResponse !== "undefined" &&
          recipeResponse !== null && recipeResponse !== "" && 
          data.source !== "conversation") {
        await saveUserHistory(user.uid, userMessage, recipeResponse);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { 
          from: 'bot', 
          text: 'Something went wrong on my end! 😔 But I\'m still here to help you create something delicious. What would you like to cook today? 🍳✨', 
          id: Date.now() 
        }
      ]);
      console.error('Error calling chat API:', error);
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechRecognition) {
      alert('Your browser does not support speech recognition');
      return;
    }
    
    if (isRecording) {
      speechRecognition.stop();
      setIsRecording(false);
    } else {
      speechRecognition.start();
      setIsRecording(true);
    }
  };

  const startEditing = (messageId: number, text: string) => {
    setEditingMessageId(messageId);
    setEditedText(text);
  };

  const saveEdit = () => {
    if (!editedText.trim()) return;
    
    setMessages(messages.map(msg => 
      msg.id === editingMessageId 
        ? { ...msg, text: editedText }
        : msg
    ));
    
    setEditingMessageId(null);
    setEditedText('');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditedText('');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const clearChat = () => {
    // Always create a new chat, regardless of whether there are messages
    // Save current chat to previous chats if it has more than one message
    if (messages.length > 1) {
      const firstUserMsg = messages.find(msg => msg.from === 'user');
      if (firstUserMsg) {
        const newChatId = Date.now();
        const newChat = {
          id: newChatId,
          title: firstUserMsg.text.length > 25 
            ? firstUserMsg.text.substring(0, 25) + '...' 
            : firstUserMsg.text,
          messages: [...messages]
        };
        
        setPreviousChats(prev => [newChat, ...prev]);
      }
    }
    
    // Clear current chat
    setCurrentChatId(null);
    setMessages([
      { from: 'bot', text: 'Chat cleared! How else can I help you today?', id: Date.now() }
    ]);
    
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    
    // Focus on input field after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const deleteChat = async(chatId: number | null, e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the click from bubbling up to the parent button
    e.stopPropagation();
    setPreviousChats(prev => prev.filter(chat => chat.id !== chatId));

  // Remove from Firestore
  const user = auth.currentUser;
  if (user && chatId !== null) {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', String(chatId)));
      console.log("Chat history deleted from Firestore:", chatId);
    } catch (error) {
      console.error("Error deleting chat from Firestore:", error);
    }
  }
    
    // If this is the current chat, reset to a new chat
    if (chatId === currentChatId) {
      setCurrentChatId(null);
      setMessages([
        { from: 'bot', text: 'Chat deleted! How else can I help you today?', id: Date.now() }
      ]);
    }
    
    // Remove the chat from previous chats
    setPreviousChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const restorePreviousChat = (chatId: number) => {
    const selectedChat = previousChats.find(chat => chat.id === chatId);
    if (selectedChat && selectedChat.messages) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
      
      // Close sidebar on mobile after selecting a chat
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const giveFeedback = (msgId: number, type: string) => {
    setShowFeedback(null);
    // In a real app, you would send this feedback to your backend
    console.log(`Feedback ${type} for message ${msgId}`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Create a theme toggler
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Add this function to display formatted markdown
  function renderFormattedText(text: string) {
    // Convert markdown-style lists to HTML
    const withBullets = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    const withOrderedLists = withBullets.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Convert markdown-style headers
    const withHeaders = withOrderedLists
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Handle paragraphs and line breaks
    const withParagraphs = withHeaders
      .split('\n\n')
      .map(para => para.trim() ? `<p>${para}</p>` : '')
      .join('');
    
    // Wrap lists properly
    const withWrappedLists = withParagraphs
      .replace(/<li>(.+)<\/li><li>/g, '<li>$1</li><li>')
      .replace(/<p><li>(.+)<\/li><\/p>/g, '<ul><li>$1</li></ul>');
    
    // Replace new lines with <br> tags within paragraphs
    const withLineBreaks = withWrappedLists.replace(/<p>(.+)\n(.+)<\/p>/g, '<p>$1<br>$2</p>');
    
    return withLineBreaks;
  }

  return (
    <div className={`h-screen w-full flex overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 text-gray-800'} font-sans`}>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transform transition-transform duration-300 fixed md:relative left-0 top-0 h-full w-72 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-900'} text-white z-30 flex flex-col shadow-lg overflow-hidden`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-800 flex items-center">
          <ChefHat className="w-6 h-6 text-emerald-500 mr-2" />
          <h2 className="text-lg font-bold">NutriChef</h2>
          <button onClick={toggleSidebar} className="ml-auto md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={clearChat}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" /> New chat
          </button>
        </div>
        
        {/* Previous Chats */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {previousChats.length > 0 ? (
              <>
                <h3 className="text-xs font-medium text-gray-400 px-2 my-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Previous chats
                </h3>
                {previousChats.map(chat => (
                  <div key={chat.id} className="flex items-center group">
                    <button 
                      onClick={() => restorePreviousChat(chat.id)}
                      className="w-full py-2 px-3 text-sm text-left text-gray-300 hover:bg-gray-700 rounded-md truncate flex-1 flex items-center"
                    >
                      <MessageSquare className="w-3 h-3 mr-2 text-gray-500" />
                      {chat.title}
                    </button>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)} 
                      className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-5 px-4 text-gray-500 text-sm flex flex-col items-center">
                <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-center">Your chat history will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-700 py-1.5 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className={`h-14 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center px-4 z-10`}>
          <button 
            id="menu-button"
            onClick={toggleSidebar} 
            className="md:hidden mr-3"
          >
            <Menu className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          <div className="flex items-center">
            <ChefHat className="w-6 h-6 text-emerald-600 mr-2" />
            <h1 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>NutriChef</h1>
          </div>
          
          {/* Theme toggle */}
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Messages */}
          <div className={`flex-1 overflow-y-auto py-4 px-4 md:px-8 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="popLayout">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={`${msg.id || idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`mb-6 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] flex ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${msg.from === 'bot' ? 'bg-emerald-600' : 'bg-blue-600'} flex items-center justify-center text-white mt-1`}>
                          {msg.from === 'bot' ? 
                            <ChefHat className="w-5 h-5" /> : 
                            <UserCircle className="w-5 h-5" />
                          }
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex-1">
                          {editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className={`p-3 rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full min-h-[80px] ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={cancelEdit}
                                  className={`px-2 py-1 text-xs ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-1`}
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                                <button 
                                  onClick={saveEdit}
                                  className="px-2 py-1 bg-emerald-500 text-white rounded-md text-xs flex items-center gap-1 hover:bg-emerald-600"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`p-3 rounded-lg ${
                                msg.from === 'bot' 
                                  ? isDarkMode 
                                    ? 'bg-gray-700 text-gray-100 rounded-tl-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
                              }`}>
                                {msg.from === 'bot' ? (
                                  <div dangerouslySetInnerHTML={{ __html: renderFormattedText(msg.text) }} />
                                ) : (
                                  msg.text
                                )}
                              </div>
                              
                              <div className="mt-1 flex items-center text-xs text-gray-500 gap-2">
                                {msg.from === 'user' && (
                                  <button 
                                    onClick={() => startEditing(msg.id, msg.text)} 
                                    className={`${isDarkMode ? 'hover:text-white' : 'hover:text-gray-800'} transition flex items-center gap-1`}
                                  >
                                    <Edit className="w-3 h-3" /> Edit
                                  </button>
                                )}
                                
                                {msg.from === 'bot' && msg.id && (
                                  <>
                                    {showFeedback === msg.id ? (
                                      <div className="flex space-x-2 items-center">
                                        <button onClick={() => giveFeedback(msg.id, 'positive')} className="p-1 hover:text-emerald-600 transition">
                                          <ThumbsUp className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => giveFeedback(msg.id, 'negative')} className="p-1 hover:text-red-600 transition">
                                          <ThumbsDown className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => setShowFeedback(null)} className={`text-xs ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-800'}`}>
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setShowFeedback(msg.id)} 
                                        className={`${isDarkMode ? 'hover:text-white' : 'hover:text-gray-800'} transition`}
                                      >
                                        Helpful?
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <ChefHat className={`mx-auto w-12 h-12 ${isDarkMode ? 'text-emerald-700' : 'text-emerald-300'} mb-3`} />
                      <p>Start a new conversation with NutriChef</p>
                    </div>
                  </div>
                )}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex justify-start"
                  >
                    <div className="max-w-[80%] flex flex-row items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white mt-1">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} rounded-tl-none`}>
                          <div className="flex space-x-2">
                            <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                            <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                            <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} z-10`}>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={isRecording ? "Listening..." : "Message NutriChef..."}
                  className={`w-full py-3 pl-4 pr-20 rounded-lg border ${
                    isRecording 
                      ? 'border-red-400 bg-red-50' 
                      : isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-800'
                  } focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all`}
                  disabled={isRecording}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={toggleVoiceRecording} 
                    className={`p-2 rounded-md ${
                      isRecording 
                        ? 'text-red-600 bg-red-100' 
                        : isDarkMode 
                          ? 'text-gray-300 hover:text-emerald-400 hover:bg-gray-600' 
                          : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
                    } transition`}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={handleSend} 
                    disabled={!input.trim() && !isRecording}
                    className={`p-2 rounded-md ${
                      isDarkMode ? 'text-emerald-400 hover:bg-gray-600' : 'text-emerald-600 hover:bg-gray-100'
                    } transition ${(!input.trim() && !isRecording) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {!speechRecognition && (
                    <span className="flex items-center text-amber-600">
                      <AlertCircle className="w-3 h-3 mr-1" /> Voice input not supported in this browser
                    </span>
                  )}
                </div>
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
