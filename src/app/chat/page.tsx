'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { saveConversation } from '@/firebase/history';
import { useRouter } from 'next/navigation';
import { 
  LogOut, UserCircle, Send, Trash2, ChefHat, Menu, X, 
  PlusCircle, Mic, MicOff, MessageSquare, Sun, Moon, 
  Star, Calendar, Coffee, Sparkles
} from 'lucide-react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";

// Global declaration for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  id: number;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastUpdated: any;
  messages: Message[];
}

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  lastUpdated: number;
}

export default function ChatPage() {
  // Core state
  const [messages, setMessages] = useState<Message[]>(
    [
      { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
    ]
  );
  const [input, setInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    uid: '',
    lastUpdated: 0
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Chat history
  const [previousChats, setPreviousChats] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);

  // Image loading state
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Helper function to handle image loading errors
  const handleImageError = (imageUrl: string, location: string) => {
    console.warn(`Profile image failed to load at ${location}:`, imageUrl);
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
  };

  // Check if image should be shown (not in error state)
  const shouldShowImage = (imageUrl: string) => {
    return imageUrl && !imageLoadErrors.has(imageUrl);
  };

  // Enhanced Profile Avatar Component
  const ProfileAvatar = ({ 
    size = 'md', 
    location = 'unknown',
    className = '' 
  }: { 
    size?: 'sm' | 'md' | 'lg' | 'xl'; 
    location?: string;
    className?: string;
  }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10', 
      lg: 'w-12 h-12',
      xl: 'w-20 h-20'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-7 h-7', 
      xl: 'w-10 h-10'
    };

    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
        {shouldShowImage(userProfile.photoURL) ? (
          <img 
            src={userProfile.photoURL}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              handleImageError(userProfile.photoURL, location);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              // Remove from error set if it loads successfully
              setImageLoadErrors(prev => {
                const newSet = new Set(prev);
                newSet.delete(userProfile.photoURL);
                return newSet;
              });
            }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDarkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'
          }`}>
            <UserCircle className={`${iconSizes[size]} ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
          </div>
        )}
      </div>
    );
  };

  // Theme detection and management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply theme styles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        document.body.style.backgroundColor = '#0f172a';
      } else {
        root.classList.remove('dark');
        document.body.style.backgroundColor = '#f8fafc';
      }
    }
  }, [isDarkMode]);

  // Sidebar click outside handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleClickOutside = (event: any) => {
        const sidebarElement = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (isSidebarOpen && sidebarElement && 
            !sidebarElement.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSidebarOpen]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, []);

  // Firebase auth and history loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Clear all user data when logging out
        setUserEmail('');
        setUserProfile({
          displayName: '',
          email: '',
          photoURL: '',
          uid: '',
          lastUpdated: 0
        });
        setPreviousChats([]);
        setCurrentConversationId(null);
        setMessages([
          { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
        ]);
        setImageLoadErrors(new Set()); // Clear image errors
        router.push('/login');
      } else {
        // Set new user data
        setUserEmail(user.email || '');
        setIsLoading(false);
        
        // Update user profile with new data
        const newProfile: UserProfile = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          uid: user.uid,
          lastUpdated: Date.now()
        };
        
        setUserProfile(newProfile);
        
        // Clear image errors for new user
        setImageLoadErrors(new Set());
        
        // Clear previous chat data before loading new user's data
        setPreviousChats([]);
        setCurrentConversationId(null);
        
        // Reset messages to welcome message
        setMessages([
          { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
        ]);
        
        // Load conversation history for the new user
        await loadConversationHistory(user.uid);
        
        console.log('✅ User logged in:', {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid
        });
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load conversation history
  const loadConversationHistory = async (userId: string) => {
    try {
      const conversationsRef = collection(db, 'users', userId, 'conversations');
      const q = query(conversationsRef, orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(q);

      const conversations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Conversation',
          lastMessage: data.lastMessage || '',
          messageCount: data.messageCount || 0,
          lastUpdated: data.lastUpdated,
          messages: data.messages || []
        };
      });

      setPreviousChats(conversations);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  // Format text with markdown-like styling
  const renderFormattedText = (text: string) => {
    let formatted = text
      .replace(/^### (.+)$/gm, `<h3 class="text-lg font-semibold mt-4 mb-2 ${isDarkMode ? 'text-emerald-400 border-emerald-600/30' : 'text-emerald-700 border-emerald-200'} border-b pb-1">$1</h3>`)
      .replace(/^## (.+)$/gm, `<h2 class="text-xl font-bold mt-4 mb-3 ${isDarkMode ? 'text-emerald-300 border-emerald-500/30' : 'text-emerald-800 border-emerald-300'} border-b-2 pb-2">$1</h2>`)
      .replace(/^• (.+)$/gm, `<li class="ml-4 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">$1</li>`)
      .replace(/^\*\*(\d+)\.\*\* (.+)$/gm, `<li class="ml-4 mb-3 font-medium"><span class="${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} font-bold">$1.</span> <span class="${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">$2</span></li>`)
      .replace(/\*\*(.+?)\*\*/g, `<strong class="font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}">$1</strong>`)
      .replace(/\*(.+?)\*/g, `<em class="italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">$1</em>`)
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
    
    formatted = `<div class="prose max-w-none ${isDarkMode ? 'prose-invert' : 'prose-emerald'}"><p class="mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}">${formatted}</p></div>`;
    
    return formatted
      .replace(/<p class="mb-3[^"]*"><li/g, '<ul class="list-none space-y-2 mb-4"><li')
      .replace(/<\/li><\/p>/g, '</li></ul>')
      .replace(/<\/li><br><li/g, '</li><li');
  };

  // Handle sending messages
  const handleSend = async (quickMessage?: string) => {
    const messageToSend = quickMessage || input.trim();
    if (!messageToSend) return;
    
    const messageId = Date.now();
    setMessages(prev => [...prev, { from: 'user', text: messageToSend, id: messageId }]);
    setInput('');
    setIsTyping(true);
    setShowQuickActions(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend,
          history: messages.slice(-5)
        }),
      });

      setIsTyping(false);
      
      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: `Sorry, I'm having trouble right now. Please try again! 🍳`, id: Date.now() }
        ]);
        return;
      }
      
      const data = await response.json();
      const recipeResponse = data.response || "I'm not sure how to help with that. Can you ask about a recipe?";

      const updatedMessages = [...messages, 
        { from: 'user', text: messageToSend, id: messageId },
        { from: 'bot', text: recipeResponse, id: Date.now() }
      ];

      setMessages(updatedMessages);
      
      // Save conversation
      const user = auth.currentUser;
      if (user) {
        try {
          const conversationId = await saveConversation(
            user.uid, 
            updatedMessages,
            currentConversationId
          );
          
          if (!currentConversationId && conversationId) {
            setCurrentConversationId(conversationId);
          }
          
          await loadConversationHistory(user.uid);
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }
      
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Something went wrong! Please try again. 🍳', id: Date.now() }
      ]);
      console.error('Error calling chat API:', error);
    }
  };

  // Quick action handlers
  const handleQuickAction = (message: string) => {
    setInput(message);
    setTimeout(() => handleSend(message), 100);
  };

  // UI handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
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

  const handleLogout = async () => {
    try {
      // Clear all user data immediately
      setUserProfile({
        displayName: '',
        email: '',
        photoURL: '',
        uid: '',
        lastUpdated: 0
      });
      setUserEmail('');
      setPreviousChats([]);
      setCurrentConversationId(null);
      setMessages([
        { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
      ]);
      setImageLoadErrors(new Set()); // Clear image errors
      
      // Sign out from Firebase
      await signOut(auth);
      
      console.log('✅ User logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const clearChat = () => {
    setMessages([
      { from: 'bot', text: 'Chat cleared! How can I help you today?', id: Date.now() }
    ]);
    setCurrentConversationId(null);
    setShowQuickActions(true);
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const loadConversationIntoChat = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      console.warn("Invalid conversation data:", conversation);
      return;
    }
    
    const chatMessages = conversation.messages.map((msg: any, index: number) => ({
      from: msg.from,
      text: msg.text,
      id: Date.now() + index
    }));
    
    setMessages(chatMessages);
    setCurrentConversationId(conversation.id);
    setIsSidebarOpen(false);
    setShowQuickActions(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setPreviousChats(prev => prev.filter(conv => conv.id !== conversationId));

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'conversations', conversationId);
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Components
  const QuickActions = () => (
    <div className={`mb-6 p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
      isDarkMode ? 'border-emerald-600/30 bg-slate-800/50' : 'border-emerald-300/50 bg-emerald-50/50'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/*
          <button
            onClick={() => handleQuickAction('Generate a healthy weekly meal plan for 2 people')}
            className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Calendar className="w-4 h-4 mx-auto mb-1" />
            Meal Plan
          </button>
          <button
            onClick={() => handleQuickAction('Show me healthy and quick breakfast recipes for busy mornings')}
            className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Coffee className="w-4 h-4 mx-auto mb-1" />
            Breakfast
          </button>
          <button
            onClick={() => handleQuickAction('What are some nutritious and easy lunch ideas for work?')}
            className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Sun className="w-4 h-4 mx-auto mb-1" />
            Lunch
          </button>
          <button
            onClick={() => handleQuickAction('Suggest some delicious dinner recipes for tonight with family')}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Moon className="w-4 h-4 mx-auto mb-1" />
            Dinner
          </button>
        */}
      </div>
    </div>
  );

  const PremiumBadge = () => (
    <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${
      isDarkMode 
        ? 'from-amber-500/20 to-yellow-500/20 text-amber-300 ring-1 ring-amber-500/30' 
        : 'from-amber-100 to-yellow-100 text-amber-700 ring-1 ring-amber-300'
    }`}>
      ✨ Premium
    </div>
  );

  // Loading screen
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <ChefHat className="w-12 h-12 mx-auto mb-4 text-emerald-600 animate-pulse" />
          <p className="text-gray-600">Loading NutriChef...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full flex overflow-hidden transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 text-gray-800'
    } font-sans`}>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`md:translate-x-0 fixed md:relative left-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode ? 'bg-slate-900/95 border-slate-700/50' : 'bg-white/95 border-gray-200/50'
        } backdrop-blur-xl border-r flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'}`}>
                <ChefHat className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NutriChef</h2>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your AI Recipe Assistant</p>
              </div>
            </div>
            
            <button 
              onClick={toggleSidebar} 
              className={`md:hidden p-2 rounded-lg transition-all ${
                isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4 flex-shrink-0">
          <button 
            onClick={clearChat}
            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all shadow-lg ${
              isDarkMode
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            Start New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-2 flex-shrink-0">
            <h3 className={`text-xs font-semibold uppercase tracking-wide ${
              isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
            }`}>Chat History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {previousChats.length === 0 ? (
              <div className={`text-sm text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No chat history yet
              </div>
            ) : (
              <div className="space-y-2">
                {previousChats.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-all ${
                      isDarkMode
                        ? 'hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-600/30'
                        : 'hover:bg-emerald-50 border border-gray-200/50 hover:border-emerald-300/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => loadConversationIntoChat(conversation)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className={`w-3 h-3 flex-shrink-0 ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`} />
                          <p className={`text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conversation.title}
                          </p>
                        </div>
                        <p className={`text-xs line-clamp-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessage}
                        </p>
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {conversation.messageCount} messages
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                          isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'
                        }`}
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'} flex-shrink-0`}>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <ProfileAvatar 
                size="lg"
                location="sidebar"
                className={isDarkMode ? 'bg-emerald-600/20 ring-2 ring-emerald-500/30' : 'bg-emerald-100 ring-2 ring-emerald-300/50'}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProfile.displayName || userProfile.email || 'Loading...'}
                  </p>
                  <PremiumBadge />
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userProfile.email || 'Google Account'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                isDarkMode 
                  ? 'bg-slate-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-400 border border-slate-600/50 hover:border-red-600/30' 
                  : 'bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Bar */}
        <div className={`h-16 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/50' : 'bg-white/80 border-gray-200/50'
        } backdrop-blur-xl border-b flex items-center px-6 z-10 flex-shrink-0`}>
          <button 
            id="menu-button"
            onClick={toggleSidebar} 
            className={`md:hidden mr-4 p-2 rounded-lg transition-all ${
              isDarkMode ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'}`}>
              <ChefHat className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                NutriChef Assistant
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isTyping ? 'Cooking up an answer...' : 'Ready to help with recipes'}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* User Profile Preview */}
            <div className="hidden md:flex items-center gap-2">
              <ProfileAvatar 
                size="sm"
                location="topbar"
                className={isDarkMode ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-emerald-300/50'}
              />
              <div className="text-right">
                <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile.displayName?.split(' ')[0] || 'User'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  Premium ✨
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl transition-all ${
                isDarkMode 
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                  : 'bg-slate-700/10 text-slate-700 hover:bg-slate-700/20'
              }`}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 relative flex flex-col overflow-hidden min-h-0">
          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto py-6 px-4 md:px-8 ${
            isDarkMode ? 'bg-slate-900/50' : 'bg-white/50'
          } backdrop-blur-sm`}>
            <div className="max-w-4xl mx-auto">
              {/* Show quick actions only for new chats */}
              {showQuickActions && messages.length === 1 && <QuickActions />}
              
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.id || idx}`}
                  className={`mb-8 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] flex ${
                    msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-start gap-4`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden ${
                      msg.from === 'bot' 
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                          : 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : isDarkMode
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600 ring-2 ring-blue-400/30'
                          : 'bg-gradient-to-br from-blue-400 to-cyan-500 ring-2 ring-blue-300/30'
                    } text-white`}>
                      {msg.from === 'bot' ? (
                        <ChefHat className="w-5 h-5" />
                      ) : (
                        <ProfileAvatar 
                          size="md"
                          location="message"
                          className="bg-transparent"
                        />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                        msg.from === 'bot' 
                          ? isDarkMode 
                            ? 'bg-slate-800/80 text-gray-100 rounded-tl-none border border-slate-700/50' 
                            : 'bg-white/90 text-gray-800 rounded-tl-none border border-gray-200/50'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-none'
                      }`}>
                        {msg.from === 'bot' ? (
                          <div dangerouslySetInnerHTML={{ __html: renderFormattedText(msg.text) }} />
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="mb-8 flex justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                        : 'bg-gradient-to-br from-emerald-400 to-green-500'
                    } text-white`}>
                      <ChefHat className="w-5 h-5" />
                    </div>
                    
                    <div className={`p-4 rounded-2xl rounded-tl-none shadow-lg ${
                      isDarkMode 
                        ? 'bg-slate-800/80 border border-slate-700/50' 
                        : 'bg-white/90 border border-gray-200/50'
                    } backdrop-blur-sm`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`} style={{ animationDelay: '300ms' }}></div>
                        <span className={`ml-2 text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          NutriChef is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`p-6 ${
            isDarkMode 
              ? 'bg-slate-900/80 border-slate-700/50' 
              : 'bg-white/80 border-gray-200/50'
          } backdrop-blur-xl border-t flex-shrink-0`}>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={isRecording ? "🎤 Listening..." : "Ask me anything about recipes..."}
                  className={`w-full py-4 px-6 pr-20 rounded-2xl border-2 transition-all duration-300 text-base ${
                    isInputFocused
                      ? isDarkMode 
                        ? 'border-emerald-500 bg-slate-800 text-white placeholder-gray-400 shadow-lg shadow-emerald-500/20' 
                        : 'border-emerald-500 bg-white text-gray-900 placeholder-gray-500 shadow-lg shadow-emerald-500/20'
                      : isDarkMode 
                        ? 'border-slate-600 bg-slate-800/50 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none backdrop-blur-sm`}
                  disabled={isRecording}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    onClick={toggleVoiceRecording} 
                    className={`p-2.5 rounded-xl transition-all ${
                      isRecording 
                        ? isDarkMode
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                        : isDarkMode 
                          ? 'hover:bg-slate-700 text-gray-400 hover:text-emerald-400' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-emerald-600'
                    }`}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button 
                    onClick={() => handleSend()} 
                    disabled={!input.trim() && !isRecording}
                    className={`p-2.5 rounded-xl transition-all ${
                      (!input.trim() && !isRecording)
                        ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                        : isDarkMode 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Helper text */}
                <div className={`flex justify-between items-center mt-3 text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    AI-powered recipe assistant
                  </span>
                  <span>
                    Press Enter to send
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <ProfileAvatar 
                size="xl"
                location="modal"
                className="mx-auto mb-4"
              />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {userProfile.displayName || 'Premium User'}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProfile.email}
              </p>
              <div className="mt-2">
                <PremiumBadge />
              </div>
              
              <button
                onClick={() => setShowProfileModal(false)}
                className={`mt-4 px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}