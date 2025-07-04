'use client';

import { MouseEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { saveUserHistory } from '@/firebase/history';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle, Send, Trash2, ChefHat, Menu, X, ThumbsUp, ThumbsDown, Clock, 
         PlusCircle, Mic, MicOff, Edit, Check, AlertCircle, BookOpen, MessageSquare, 
         Sun, Moon, Star, Heart, Coffee, Search, Settings, Sparkles, Calendar } from 'lucide-react';
import { collection, getDocs, query, orderBy , deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// Global declaration for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function ChatPage() {
  // ✅ ALL STATE DECLARATIONS
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I\'m NutriChef, your recipe assistant. How can I help you today?', id: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [previousChats, setPreviousChats] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [lastIngredient, setLastIngredient] = useState('');
  const [ingredientOffset, setIngredientOffset] = useState(0);
  const [relatedSuggestions, setRelatedSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ✅ THEME DETECTION
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

  // ✅ APPLY THEME STYLES
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

  // ✅ SIDEBAR CLICK OUTSIDE HANDLER
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, [isSidebarOpen]);

  // ✅ SPEECH RECOGNITION SETUP
  useEffect(() => {
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

  // ✅ FIREBASE AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || '');
        setIsLoading(false);

        try {
          const historyRef = collection(db, 'users', user.uid, 'history');
          const q = query(historyRef, orderBy('timestamp', 'desc'));
          const querySnapshot = await getDocs(q);

          const chats = querySnapshot.docs.map((doc, idx) => ({
            id: doc.id,
            title: doc.data().title || `Chat ${idx + 1}`,
            messages: doc.data().messages || [],
          }));
          setPreviousChats(chats);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // ✅ HELPER FUNCTIONS
  function cleanRecipeResponse(response: string): string {
    const lines = response.split('\n');
    const cleanedLines = [];
    let seenRelatedSection = false;
    
    for (const line of lines) {
      if (line.includes('You might also enjoy') || line.includes('🍽️')) {
        if (!seenRelatedSection) {
          cleanedLines.push(line);
          seenRelatedSection = true;
        }
      } else {
        cleanedLines.push(line);
      }
    }
    
    return cleanedLines.join('\n');
  }

  function renderFormattedText(text: string) {
    const isDark = isDarkMode;
    
    let formatted = text
      .replace(/^### (.+)$/gm, `<h3 class="text-lg font-semibold mt-4 mb-2 ${isDark ? 'text-emerald-400 border-emerald-600/30' : 'text-emerald-700 border-emerald-200'} border-b pb-1">$1</h3>`)
      .replace(/^## (.+)$/gm, `<h2 class="text-xl font-bold mt-4 mb-3 ${isDark ? 'text-emerald-300 border-emerald-500/30' : 'text-emerald-800 border-emerald-300'} border-b-2 pb-2">$1</h2>`)
      .replace(/^• (.+)$/gm, `<li class="ml-4 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}">$1</li>`)
      .replace(/^\*\*(\d+)\.\*\* (.+)$/gm, `<li class="ml-4 mb-3 font-medium"><span class="${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-bold">$1.</span> <span class="${isDark ? 'text-gray-300' : 'text-gray-700'}">$2</span></li>`)
      .replace(/\*\*(.+?)\*\*/g, `<strong class="font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}">$1</strong>`)
      .replace(/\*(.+?)\*/g, `<em class="italic ${isDark ? 'text-gray-400' : 'text-gray-600'}">$1</em>`)
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
    
    formatted = `<div class="prose max-w-none ${isDark ? 'prose-invert' : 'prose-emerald'}"><p class="mb-3 ${isDark ? 'text-gray-300' : 'text-gray-800'}">${formatted}</p></div>`;
    
    formatted = formatted
      .replace(/<p class="mb-3[^"]*"><li/g, '<ul class="list-none space-y-2 mb-4"><li')
      .replace(/<\/li><\/p>/g, '</li></ul>')
      .replace(/<\/li><br><li/g, '</li><li');
    
    return formatted;
  }

  // ✅ RECIPE FUNCTIONS
  async function getIngredientRecipes(ingredient: string, more = false) {
    let newOffset = ingredientOffset;
    if (!more || lastIngredient !== ingredient) {
      newOffset = 0;
      setLastIngredient(ingredient);
    } else {
      newOffset += 10;
    }
    setIngredientOffset(newOffset);

    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `recipes from ${ingredient}`, offset: newOffset }),
      });
      setIsTyping(false);

      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { 
            from: 'bot', 
            text: `Oops! 😅 I'm having a little trouble right now. Try again! 🍳`, 
            id: Date.now() 
          }
        ]);
        return;
      }

      const data = await response.json();

      if (!data.response || data.response.trim() === "" || data.response.toLowerCase().includes("no more recipes")) {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: "No more recipes found for this ingredient.", id: Date.now() }
        ]);
        return;
      }

      // After you get the main recipe response (e.g., for "Paneer Butter Masala")
      const mainRecipeText = data.response; // your main recipe string
      const dishName = extractDishName(mainRecipeText); // implement this to get the dish name

      // Fetch related recipes
      const relatedRes = await fetch('/api/related-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish_name: dishName }),
      });
      const relatedData = await relatedRes.json();

      let relatedSection = '';
      if (relatedData.success && relatedData.suggestions.length > 0) {
        relatedSection = `\n\n🍽️ **You might also enjoy:**\n` +
          relatedData.suggestions.map((title, i) => `- ${title}`).join('\n');
      }

      // Combine and display
      const fullRecipeText = mainRecipeText + relatedSection;

      setMessages(prev => [
        ...prev,
        { from: 'bot', text: fullRecipeText, id: Date.now() }
      ]);
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
  }

  const getMealTypeRecipes = async (mealType: string, emoji: string) => {
    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:5000/api/recipes-by-meal-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_type: mealType, limit: 8 })
      });
      
      const data = await response.json();
      
      if (data.success && data.recipes.length > 0) {
        let recipeText = `## ${emoji} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe Ideas\n\n`;
        recipeText += `*Here are some delicious ${mealType} options for you!* 🍳\n\n`;
        
        data.recipes.forEach((recipe: any, index: number) => {
          recipeText += `**${index + 1}. ${recipe.title}**\n`;
          
          if (recipe.dietary_info && recipe.dietary_info.dietary_tags.length > 0) {
            const tags = recipe.dietary_info.dietary_tags.slice(0, 3).join(', ');
            recipeText += `   *${tags}*\n`;
          }
          recipeText += '\n';
        });
        
        recipeText += `**Want the full recipe for any of these?** Just ask me! 😊`;
        
        setMessages(prev => [...prev, { from: 'bot', text: recipeText, id: Date.now() }]);
      }
    } catch (error) {
      console.error(`Error getting ${mealType} recipes:`, error);
    }
    setIsTyping(false);
  };

  const generateMealPlan = async () => {
    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 7, dietary_preferences: [] })
      });
      
      const data = await response.json();
      
      if (data.success) {
        let mealPlanText = "## 📅 Your 7-Day Meal Plan\n\n*Here's a personalized meal plan just for you!* ✨\n\n";
        
        Object.entries(data.meal_plan.meal_plan).forEach(([day, meals]: [string, any]) => {
          mealPlanText += `### ${day}\n`;
          mealPlanText += `🌅 **Breakfast:** ${meals.breakfast?.title || 'Free choice'}\n`;
          mealPlanText += `🍽️ **Lunch:** ${meals.lunch?.title || 'Free choice'}\n`;
          mealPlanText += `🌙 **Dinner:** ${meals.dinner?.title || 'Free choice'}\n`;
          mealPlanText += `🍿 **Snack:** ${meals.snack?.title || 'Free choice'}\n\n`;
        });
        
        mealPlanText += "**Want a specific recipe from this plan?** Just ask me about any dish! 😊";
        
        setMessages(prev => [...prev, { from: 'bot', text: mealPlanText, id: Date.now() }]);
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
    setIsTyping(false);
  };

  const getBreakfastRecipes = () => getMealTypeRecipes('breakfast', '🌅');
  const getLunchRecipes = () => getMealTypeRecipes('lunch', '🍽️');
  const getDinnerRecipes = () => getMealTypeRecipes('dinner', '🌙');

  // ✅ MAIN FUNCTIONS
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const messageId = Date.now();
    const userMessage = input;

    setMessages(prev => [...prev, { from: 'user', text: userMessage, id: messageId }]);
    setInput('');
    setIsTyping(true);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.slice(-5) // Last 5 messages for context
        }),
      });

      setIsTyping(false);
      
      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { 
            from: 'bot', 
            text: `Sorry, I'm having trouble right now. Please try again! 🍳`, 
            id: Date.now() 
          }
        ]);
        return;
      }
      
      const data = await response.json();
      let recipeResponse = data.response || "I'm not sure how to help with that. Can you ask about a recipe?";

      // --- SUGGEST RELATED RECIPES ---
      // Try to extract the dish name from the recipe title (first line or use input)
      let dishName = '';
      const match = recipeResponse.match(/^([^\n]+)\n/); // first line as title
      if (match && match[1].length < 60) {
        dishName = match[1].replace(/[^a-zA-Z0-9 ]/g, '').trim();
      } else {
        dishName = userMessage.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      }

      // Fetch related recipes
      let relatedSection = '';
      try {
        const relatedRes = await fetch('/api/related-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dish_name: dishName }),
        });
        const relatedData = await relatedRes.json();
        if (relatedData.success && relatedData.suggestions.length > 0) {
          relatedSection = `\n\n🍽️ **You might also enjoy:**\n` +
            relatedData.suggestions.map((title: string) => `- ${title}`).join('\n');
        }
      } catch (err) {
        // Ignore related recipe errors, just show main recipe
      }

      recipeResponse += relatedSection;

      setMessages(prev => [
        ...prev,
        { from: 'bot', text: recipeResponse, id: Date.now() }
      ]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { 
          from: 'bot', 
          text: 'Something went wrong! Please try again. 🍳', 
          id: Date.now() 
        }
      ]);
      console.error('Error calling chat API:', error);
    }
  };

  // ✅ OTHER FUNCTIONS
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
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const clearChat = async () => {
    if (messages.length > 1) {
      const firstUserMsg = messages.find(m => m.from === 'user');
      const title = firstUserMsg
        ? firstUserMsg.text.substring(0, 25)
        : `Chat ${previousChats.length + 1}`;

      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        await saveUserHistory(user.uid, title, messages);
      }

      // Save to UI
      setPreviousChats(prev => [
        {
          id: Date.now().toString(),
          title,
          messages: [...messages],
        },
        ...prev,
      ]);
    }

    setMessages([
      { from: 'bot', text: 'Chat cleared! How can I help you today?', id: Date.now() }
    ]);

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add this function inside your ChatPage component:
  const handleDeleteHistory = async (chatId: string) => {
    // Remove from UI
    setPreviousChats(prev => prev.filter(chat => chat.id !== chatId));

    // Remove from Firestore
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'history', chatId);
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
    }
  };

  // Show loading screen while checking authentication
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

  // ✅ QUICK ACTIONS COMPONENT
  const QuickActions = () => (
    <div className={`mb-6 p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
      isDarkMode 
        ? 'border-emerald-600/30 bg-slate-800/50' 
        : 'border-emerald-300/50 bg-emerald-50/50'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setInput('Generate a meal plan for this week')}
          className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Calendar className="w-4 h-4 mx-auto mb-1" />
          Meal Plan
        </button>
        <button
          onClick={() => setInput('Show me breakfast recipes')}
          className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Coffee className="w-4 h-4 mx-auto mb-1" />
          Breakfast
        </button>
        <button
          onClick={() => setInput('What should I cook for lunch?')}
          className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Sun className="w-4 h-4 mx-auto mb-1" />
          Lunch
        </button>
        <button
          onClick={() => setInput('Suggest dinner recipes')}
          className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Moon className="w-4 h-4 mx-auto mb-1" />
          Dinner
        </button>
      </div>
    </div>
  );

  // ✅ SIDEBAR COMPONENT
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
          isDarkMode 
            ? 'bg-slate-900/95 border-slate-700/50' 
            : 'bg-white/95 border-gray-200/50'
        } backdrop-blur-xl border-r flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'} flex items-center`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'}`}>
              <ChefHat className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                NutriChef
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Your AI Recipe Assistant
              </p>
            </div>
          </div>
          
          <button 
            onClick={toggleSidebar} 
            className={`ml-auto md:hidden p-2 rounded-lg transition-all ${
              isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
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

        {/* Chat History Section */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <h3 className={`text-xs font-semibold mb-2 mt-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
            Chat History
          </h3>
          {previousChats.length === 0 && (
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No history yet.</div>
          )}
          <ul>
            {previousChats.map((chat) => (
              <li
                key={chat.id}
                className={`mb-2 p-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                  isDarkMode
                    ? 'hover:bg-slate-800 text-gray-200'
                    : 'hover:bg-emerald-50 text-gray-700'
                }`}
              >
                <span
                  className="flex-1 flex items-center min-w-0"
                  onClick={() => {
                    setMessages(chat.messages);
                    setIsSidebarOpen(false);
                  }}
                  title={chat.title}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  <BookOpen className="inline w-4 h-4 mr-2 flex-shrink-0" />
                  {chat.title}
                </span>
                <button
                  className={`ml-2 p-1 rounded hover:bg-red-100 ${isDarkMode ? 'hover:bg-red-900' : ''}`}
                  title="Delete chat"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteHistory(chat.id);
                  }}
                >
                  <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User Profile */}
        <div className={`mt-auto p-4 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'
              }`}>
                <UserCircle className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userEmail || 'Loading...'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Premium User
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
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className={`h-16 ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-700/50' 
            : 'bg-white/80 border-gray-200/50'
        } backdrop-blur-xl border-b flex items-center px-6 z-10`}>
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
          
          {/* Theme Toggle */}
          <div className="ml-auto flex items-center gap-3">
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
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto py-6 px-4 md:px-8 ${
            isDarkMode ? 'bg-slate-900/50' : 'bg-white/50'
          } backdrop-blur-sm`}>
            <div className="max-w-4xl mx-auto">
              {/* Quick Actions - only show on first message */}
              
              {messages.length === 1 && <QuickActions />}
              
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.id || idx}`}
                  className={`mb-8 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] flex ${
                    msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-start gap-4`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      msg.from === 'bot' 
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                          : 'bg-gradient-to-br from-emerald-400 to-green-500'
                        : isDarkMode
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                    } text-white`}>
                      {msg.from === 'bot' ? 
                        <ChefHat className="w-5 h-5" /> : 
                        <UserCircle className="w-5 h-5" />
                      }
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1">
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
                          <p className="whitespace-pre-wrap">{msg.text}</p>
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
          } backdrop-blur-xl border-t`}>
            <div className="max-w-4xl mx-auto">
              {/* Only one .relative wrapper here */}
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
                    onClick={handleSend} 
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

                {/* Helper text below input, single row */}
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
    </div>
  );
}
