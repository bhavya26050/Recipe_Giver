'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, Sparkles, Users, Clock, Star, Send, MessageCircle, 
         Play, Volume2, Heart, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Interactive chat messages
  const chatMessages = [
    {
      type: 'user',
      text: "I have chicken, rice, and some spices. What can I make?",
      delay: 1000
    },
    {
      type: 'bot',
      text: "Perfect! I can help you make delicious Chicken Biryani! 🍛\n\n**Ingredients you'll need:**\n• 2 cups basmati rice\n• 500g chicken pieces\n• Biryani spices\n• Onions, yogurt, mint\n\n**Cooking time:** 45 minutes\n**Difficulty:** Medium\n\nWould you like the step-by-step recipe?",
      delay: 2000
    },
    {
      type: 'user',
      text: "Yes! And make it healthy please 🙏",
      delay: 1500
    },
    {
      type: 'bot',
      text: "Absolutely! Here's a **healthy version** using less oil and more herbs:\n\n✨ **Step 1:** Soak rice for 30 minutes\n✨ **Step 2:** Marinate chicken in yogurt & spices\n✨ **Step 3:** Layer rice and chicken\n✨ **Step 4:** Steam cook for 25 minutes\n\n**Nutrition:** High protein, low fat\n**Calories:** ~420 per serving\n\nEnjoy your healthy biryani! 👨‍🍳",
      delay: 3000
    }
  ];

  // Auto-play chat animation
  useEffect(() => {
    if (currentMessageIndex < chatMessages.length) {
      const message = chatMessages[currentMessageIndex];
      const timer = setTimeout(() => {
        if (message.type === 'bot') {
          setIsTyping(true);
          // Simulate typing effect
          setTimeout(() => {
            setIsTyping(false);
            setCurrentMessageIndex(prev => prev + 1);
          }, 1500);
        } else {
          setCurrentMessageIndex(prev => prev + 1);
        }
      }, message.delay);

      return () => clearTimeout(timer);
    } else {
      // Reset after all messages
      setTimeout(() => {
        setCurrentMessageIndex(0);
      }, 5000);
    }
  }, [currentMessageIndex]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ✨ ENHANCED ANIMATED BACKGROUND WITH LINES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Modern gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-emerald-50 to-green-100/60"></div>
        
        {/* Enhanced animated mesh background with flowing lines */}
        <div className="absolute inset-0 opacity-60">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Enhanced gradient definitions for lines */}
              <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3"/>
              </linearGradient>
              
              <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#059669" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.25"/>
              </linearGradient>

              <linearGradient id="lineGradient3" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#047857" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2"/>
              </linearGradient>

              <radialGradient id="spotGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                <stop offset="70%" stopColor="#22c55e" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>

              {/* Gradient for grid lines */}
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.15"/>
              </linearGradient>
            </defs>
            
            {/* Animated grid pattern */}
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="url(#gridGradient)" strokeWidth="1" opacity="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Flowing horizontal lines */}
            <path d="M0,150 Q300,100 600,150 Q900,200 1200,150" fill="none" stroke="url(#lineGradient1)" strokeWidth="2" opacity="0.6">
              <animate attributeName="d" 
                values="M0,150 Q300,100 600,150 Q900,200 1200,150;
                        M0,170 Q300,120 600,170 Q900,180 1200,170;
                        M0,150 Q300,100 600,150 Q900,200 1200,150" 
                dur="15s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.8;0.4;0.6" dur="8s" repeatCount="indefinite"/>
            </path>
            
            <path d="M0,300 Q400,250 800,300 Q1000,350 1200,300" fill="none" stroke="url(#lineGradient2)" strokeWidth="2.5" opacity="0.5">
              <animate attributeName="d" 
                values="M0,300 Q400,250 800,300 Q1000,350 1200,300;
                        M0,320 Q400,270 800,320 Q1000,330 1200,320;
                        M0,300 Q400,250 800,300 Q1000,350 1200,300" 
                dur="18s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.7;0.3;0.5" dur="10s" repeatCount="indefinite"/>
            </path>
            
            <path d="M0,450 Q200,400 400,450 Q600,500 800,450 Q1000,400 1200,450" fill="none" stroke="url(#lineGradient3)" strokeWidth="1.5" opacity="0.7">
              <animate attributeName="d" 
                values="M0,450 Q200,400 400,450 Q600,500 800,450 Q1000,400 1200,450;
                        M0,430 Q200,420 400,430 Q600,480 800,430 Q1000,420 1200,430;
                        M0,450 Q200,400 400,450 Q600,500 800,450 Q1000,400 1200,450" 
                dur="20s" repeatCount="indefinite"/>
            </path>
            
            {/* Vertical flowing lines */}
            <path d="M200,0 Q150,200 200,400 Q250,600 200,800" fill="none" stroke="url(#lineGradient1)" strokeWidth="1.5" opacity="0.4">
              <animate attributeName="d" 
                values="M200,0 Q150,200 200,400 Q250,600 200,800;
                        M220,0 Q170,200 220,400 Q270,600 220,800;
                        M200,0 Q150,200 200,400 Q250,600 200,800" 
                dur="22s" repeatCount="indefinite"/>
            </path>
            
            <path d="M600,0 Q550,150 600,300 Q650,450 600,600 Q550,750 600,800" fill="none" stroke="url(#lineGradient2)" strokeWidth="2" opacity="0.3">
              <animate attributeName="d" 
                values="M600,0 Q550,150 600,300 Q650,450 600,600 Q550,750 600,800;
                        M620,0 Q570,150 620,300 Q670,450 620,600 Q570,750 620,800;
                        M600,0 Q550,150 600,300 Q650,450 600,600 Q550,750 600,800" 
                dur="25s" repeatCount="indefinite"/>
            </path>
            
            <path d="M1000,0 Q950,100 1000,200 Q1050,300 1000,400 Q950,500 1000,600 Q1050,700 1000,800" fill="none" stroke="url(#lineGradient3)" strokeWidth="1" opacity="0.5">
              <animate attributeName="d" 
                values="M1000,0 Q950,100 1000,200 Q1050,300 1000,400 Q950,500 1000,600 Q1050,700 1000,800;
                        M980,0 Q930,100 980,200 Q1030,300 980,400 Q930,500 980,600 Q1030,700 980,800;
                        M1000,0 Q950,100 1000,200 Q1050,300 1000,400 Q950,500 1000,600 Q1050,700 1000,800" 
                dur="28s" repeatCount="indefinite"/>
            </path>
            
            {/* Diagonal flowing lines */}
            <path d="M0,0 Q300,200 600,100 Q900,300 1200,200" fill="none" stroke="url(#lineGradient1)" strokeWidth="1.5" opacity="0.4">
              <animate attributeName="d" 
                values="M0,0 Q300,200 600,100 Q900,300 1200,200;
                        M0,20 Q300,180 600,120 Q900,280 1200,220;
                        M0,0 Q300,200 600,100 Q900,300 1200,200" 
                dur="30s" repeatCount="indefinite"/>
            </path>
            
            <path d="M1200,0 Q900,150 600,50 Q300,250 0,150" fill="none" stroke="url(#lineGradient2)" strokeWidth="2" opacity="0.3">
              <animate attributeName="d" 
                values="M1200,0 Q900,150 600,50 Q300,250 0,150;
                        M1200,20 Q900,130 600,70 Q300,230 0,170;
                        M1200,0 Q900,150 600,50 Q300,250 0,150" 
                dur="35s" repeatCount="indefinite"/>
            </path>
            
            {/* Curved connecting lines */}
            <path d="M0,600 C200,500 400,700 600,600 C800,500 1000,700 1200,600" fill="none" stroke="url(#lineGradient3)" strokeWidth="3" opacity="0.6">
              <animate attributeName="d" 
                values="M0,600 C200,500 400,700 600,600 C800,500 1000,700 1200,600;
                        M0,620 C200,520 400,680 600,620 C800,520 1000,680 1200,620;
                        M0,600 C200,500 400,700 600,600 C800,500 1000,700 1200,600" 
                dur="16s" repeatCount="indefinite"/>
            </path>
            
            <path d="M0,700 S300,550 600,700 S900,850 1200,700" fill="none" stroke="url(#lineGradient1)" strokeWidth="2" opacity="0.5">
              <animate attributeName="d" 
                values="M0,700 S300,550 600,700 S900,850 1200,700;
                        M0,680 S300,570 600,680 S900,830 1200,680;
                        M0,700 S300,550 600,700 S900,850 1200,700" 
                dur="20s" repeatCount="indefinite"/>
            </path>
            
            {/* Enhanced floating geometric shapes */}
            <circle cx="200" cy="150" r="80" fill="url(#spotGradient)">
              <animateTransform attributeName="transform" type="translate" 
                values="0,0; 30,-20; 0,0" dur="15s" repeatCount="indefinite"/>
            </circle>
            
            <circle cx="800" cy="600" r="60" fill="url(#spotGradient)">
              <animateTransform attributeName="transform" type="translate" 
                values="0,0; -25,15; 0,0" dur="18s" repeatCount="indefinite"/>
            </circle>
            
            <circle cx="1000" cy="200" r="40" fill="url(#spotGradient)">
              <animateTransform attributeName="transform" type="translate" 
                values="0,0; 20,25; 0,0" dur="12s" repeatCount="indefinite"/>
            </circle>

            <circle cx="400" cy="400" r="50" fill="url(#spotGradient)" opacity="0.7">
              <animateTransform attributeName="transform" type="translate" 
                values="0,0; -15,30; 0,0" dur="22s" repeatCount="indefinite"/>
            </circle>
            
            {/* Additional connection points */}
            <circle cx="300" cy="250" r="3" fill="#10b981" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.3;0.6" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="700" cy="350" r="2" fill="#22c55e" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.9;0.2;0.5" dur="6s" repeatCount="indefinite"/>
            </circle>
            <circle cx="500" cy="500" r="4" fill="#14b8a6" opacity="0.7">
              <animate attributeName="opacity" values="0.7;1;0.4;0.7" dur="5s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>

        {/* Enhanced dots pattern with better visibility */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>

        {/* Enhanced interactive mouse-following gradient */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-15 transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(34, 197, 94, 0.4) 40%, rgba(20, 184, 166, 0.2) 70%, transparent 90%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>

        {/* Enhanced floating food icons */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 animate-float-gentle opacity-25">
            <ChefHat className="w-8 h-8 text-emerald-700" />
          </div>
          <div className="absolute top-3/4 right-1/4 animate-float-gentle-delayed opacity-20">
            <Sparkles className="w-6 h-6 text-green-700" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate-float-gentle-slow opacity-15">
            <Star className="w-5 h-5 text-teal-700" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float-gentle-fast opacity-30">
            <Heart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="absolute top-1/3 left-1/2 animate-float-gentle opacity-20">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div className="absolute bottom-1/3 right-1/2 animate-float-gentle-slow opacity-25">
            <Award className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/15 to-gray-100/25"></div>
        
        {/* Animated line streaks */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-slide-right"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-slide-right-delayed"></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/25 to-transparent animate-slide-right-slow"></div>
          
          <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-slide-down"></div>
          <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-green-400/15 to-transparent animate-slide-down-delayed"></div>
          <div className="absolute left-3/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-teal-400/20 to-transparent animate-slide-down-slow"></div>
        </div>
      </div>

      <main className="relative z-10">
        {/* Enhanced Navigation with better contrast */}
        <nav className="bg-white/80 backdrop-blur-2xl border-b border-emerald-100/40 sticky top-0 z-50 shadow-lg shadow-emerald-500/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">NutriChef</span>
                <div className="hidden md:flex items-center gap-1 ml-2 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-1 rounded-full border border-emerald-200/40">
                  <Star className="w-3 h-3 text-emerald-600 fill-current" />
                  <span className="text-xs font-medium text-emerald-700">4.9</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-all hover:bg-emerald-50/60 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Enhanced Hero Section with better element contrast */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg border border-emerald-200/40 hover:shadow-xl transition-all">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI-Powered Recipe Assistant
                <div className="flex gap-1 ml-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-75"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-150"></div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Personal
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent block animate-shimmer">
                  Recipe Chef
                </span>
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
                Discover, create, and share amazing recipes with our AI-powered cooking assistant. 
                From quick weeknight dinners to gourmet weekend projects.
              </p>
              
              {/* Enhanced Stats with better backgrounds */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/40 hover:shadow-xl transition-all hover:scale-105">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-800">50K+ Users</span>
                </div>
                <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/40 hover:shadow-xl transition-all hover:scale-105">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-800">10K+ Recipes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/40 hover:shadow-xl transition-all hover:scale-105">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-gray-800">Award Winning</span>
                </div>
              </div>
            </div>

            {/* Enhanced action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => router.push('/register')}
                className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                Start Cooking
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="group flex items-center gap-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200/40 hover:border-gray-300/60 transition-all shadow-lg hover:shadow-xl"
              >
                <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Sign In
              </button>
            </div>

            {/* Enhanced Interactive Chat Demo with better contrast */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/40 overflow-hidden hover:shadow-3xl transition-all">
                {/* Chat Header - keeping as is since it's already well visible */}
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">NutriChef Assistant</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="text-emerald-100 text-sm">Online • Cooking tips ready</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Volume2 className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Chat Messages area */}
                <div className="p-6 h-96 overflow-y-auto bg-gradient-to-b from-emerald-50/40 via-green-50/30 to-teal-50/40">
                  <div className="space-y-4">
                    {chatMessages.slice(0, currentMessageIndex).map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                      >
                        <div className={`max-w-xs lg:max-w-md flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                            message.type === 'user' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                              : 'bg-gradient-to-r from-emerald-500 to-green-500'
                          }`}>
                            {message.type === 'user' ? (
                              <span className="text-white text-xs font-bold">You</span>
                            ) : (
                              <ChefHat className="w-4 h-4 text-white" />
                            )}
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={`px-4 py-3 rounded-2xl shadow-lg border ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-none border-blue-200/50'
                              : 'bg-white/80 text-gray-800 rounded-tl-none border-gray-200/30 backdrop-blur-sm'
                          }`}>
                            {message.type === 'bot' ? (
                              <div 
                                className="text-sm leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: message.text
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-emerald-700">$1</strong>')
                                    .replace(/\n/g, '<br>')
                                }}
                              />
                            ) : (
                              <p className="text-sm leading-relaxed">{message.text}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start animate-slide-in">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <ChefHat className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-tl-none shadow-lg border border-gray-200/30">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                              <span className="ml-2 text-xs text-gray-500">NutriChef is cooking up an answer...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Chat Input Demo */}
                <div className="border-t border-gray-200/40 p-4 bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Ask me anything about cooking..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/70 backdrop-blur-sm"
                        disabled
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Send className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/register')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Try Now
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    ✨ Join thousands of home cooks getting instant recipe help
                  </p>
                </div>
              </div>

              {/* Enhanced Floating Action Indicators */}
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/40 p-3 animate-bounce">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">Live Demo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-16 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose NutriChef?
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Everything you need to become a better cook, powered by AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100/40 hover:border-emerald-200/60 transform hover:-translate-y-2">
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recipe Generation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Get personalized recipes based on your ingredients, dietary preferences, and cooking style.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>10,000+ recipes generated daily</span>
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100/40 hover:border-blue-200/60 transform hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Meal Planning</h3>
                <p className="text-gray-700 leading-relaxed">
                  Plan your entire week with smart meal suggestions and automated shopping lists.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Save 5+ hours per week</span>
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100/40 hover:border-purple-200/60 transform hover:-translate-y-2">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dietary Support</h3>
                <p className="text-gray-700 leading-relaxed">
                  Accommodates all dietary needs - vegan, keto, gluten-free, and more.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>15+ dietary preferences supported</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl p-12 text-white overflow-hidden">
              {/* Enhanced background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  <defs>
                    <pattern id="ctaPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="white"/>
                      <circle cx="5" cy="15" r="0.5" fill="white" opacity="0.5"/>
                      <circle cx="15" cy="5" r="0.5" fill="white" opacity="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ctaPattern)"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Transform Your Cooking?
                </h2>
                <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of home cooks who are already creating amazing meals with NutriChef
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => router.push('/register')}
                    className="group bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg transition-all inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-xl shadow-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">NutriChef</span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-gray-400">© 2024 NutriChef. All rights reserved.</span>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                  ))}
                  <span className="text-sm text-gray-300 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ✨ ENHANCED CUSTOM STYLES WITH LINE ANIMATIONS */}
      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-gentle-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
        }
        
        @keyframes float-gentle-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes float-gentle-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-3deg); }
        }
        
        @keyframes slide-right {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes slide-right-delayed {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes slide-right-slow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes slide-down {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes slide-down-delayed {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes slide-down-slow {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 4s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }
        
        .animate-float-gentle-delayed {
          animation: float-gentle-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-float-gentle-slow {
          animation: float-gentle-slow 12s ease-in-out infinite;
          animation-delay: 4s;
        }
        
        .animate-float-gentle-fast {
          animation: float-gentle-fast 6s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-slide-right {
          animation: slide-right 8s ease-in-out infinite;
        }
        
        .animate-slide-right-delayed {
          animation: slide-right-delayed 10s ease-in-out infinite;
          animation-delay: 3s;
        }
        
        .animate-slide-right-slow {
          animation: slide-right-slow 12s ease-in-out infinite;
          animation-delay: 6s;
        }
        
        .animate-slide-down {
          animation: slide-down 15s ease-in-out infinite;
        }
        
        .animate-slide-down-delayed {
          animation: slide-down-delayed 18s ease-in-out infinite;
          animation-delay: 5s;
        }
        
        .animate-slide-down-slow {
          animation: slide-down-slow 20s ease-in-out infinite;
          animation-delay: 10s;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}