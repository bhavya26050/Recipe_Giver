'use client';

import { MouseEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle, Send, Trash2, ChefHat, Menu, X, ThumbsUp, ThumbsDown, Clock, 
         PlusCircle, Mic, MicOff, Edit, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Add this type declaration above your component or at the top of the file
  // Extend the Window interface to include webkitSpeechRecognition
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  type SpeechRecognition = typeof window.webkitSpeechRecognition;
  
    const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || '');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const messageId = Date.now();
    setMessages(prev => [...prev, { from: 'user', text: input, id: messageId }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    const userMessage = input;
    setInput('');
    
    // Focus the input after sending
    inputRef.current?.focus();
    
    // Simulate response after a delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { from: 'bot', text: `I'll help you find recipes with "${userMessage}". What type of cuisine are you interested in?`, id: Date.now() }
      ]);
    }, 1500);
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
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const deleteChat = (chatId: number | null, e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent the click from bubbling up to the parent button
      e.stopPropagation();
      
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

  // New function to restore a previous chat
  const restorePreviousChat = (chatId: number) => {
    const selectedChat = previousChats.find(chat => chat.id === chatId);
    if (selectedChat && selectedChat.messages) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
      // On mobile, close the sidebar after selecting a chat
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

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transform transition-transform duration-300 fixed md:static left-0 top-0 h-full w-64 bg-gray-900 text-white z-30 flex flex-col shadow-lg overflow-hidden`}>
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
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 p-2">
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
                      className="w-full py-2 px-3 text-sm text-left text-gray-300 hover:bg-gray-700 rounded-md truncate flex-1"
                    >
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
              <div className="py-3 px-2 text-gray-500 text-xs italic">
                No previous chats
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
            <div className="overflow-hidden">
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
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 z-20">
          <button onClick={toggleSidebar} className="md:hidden mr-3">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center">
            <ChefHat className="w-6 h-6 text-emerald-600 mr-2" />
            <h1 className="text-lg font-medium text-gray-700">NutriChef</h1>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 px-4 md:px-8 z-10 bg-white">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence>
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={`${msg.id || idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                                className="p-3 rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full min-h-[80px]"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={cancelEdit}
                                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                                <button 
                                  onClick={saveEdit}
                                  className="px-2 py-1 bg-emerald-500 text-white rounded-md text-xs flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`p-3 rounded-lg ${
                                msg.from === 'bot' 
                                  ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
                              }`}>
                                {msg.text}
                              </div>
                              
                              <div className="mt-1 flex items-center text-xs text-gray-500 gap-2">
                                {msg.from === 'user' && (
                                  <button 
                                    onClick={() => startEditing(msg.id, msg.text)} 
                                    className="hover:text-gray-800 transition flex items-center gap-1"
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
                                        <button onClick={() => setShowFeedback(null)} className="text-xs hover:text-gray-800">
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setShowFeedback(msg.id)} 
                                        className="hover:text-gray-800 transition"
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
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <ChefHat className="mx-auto w-12 h-12 text-emerald-300 mb-3" />
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
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
          <div className="p-4 border-t border-gray-200 bg-white z-10">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={isRecording ? "Listening..." : "Message NutriChef..."}
                  className={`w-full py-3 pl-4 pr-20 rounded-lg border ${isRecording ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all`}
                  disabled={isRecording}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={toggleVoiceRecording} 
                    className={`p-2 rounded-md ${isRecording ? 'text-red-600 bg-red-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-100'} transition`}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={handleSend} 
                    disabled={!input.trim() && !isRecording}
                    className={`p-2 rounded-md text-emerald-600 hover:bg-gray-100 transition ${(!input.trim() && !isRecording) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <div className="text-gray-500">
                  {!speechRecognition && (
                    <span className="flex items-center text-amber-600">
                      <AlertCircle className="w-3 h-3 mr-1" /> Voice input not supported in this browser
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
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
