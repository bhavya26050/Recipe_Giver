'use client';

import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { ChefHat, Star, Heart, Clock, Utensils, Sparkles, Users, Trophy, Play } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/chat');
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center">
          <ChefHat className="w-12 h-12 mx-auto mb-4 text-emerald-600 animate-pulse" />
          <p className="text-gray-600">Loading NutriChef...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20">
              <ChefHat className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NutriChef</h1>
              <p className="text-xs text-gray-500">AI Recipe Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-20 h-20 text-emerald-600">
            <Utensils className="w-full h-full" />
          </div>
          <div className="absolute top-40 right-20 w-16 h-16 text-green-600">
            <Heart className="w-full h-full" />
          </div>
          <div className="absolute bottom-40 left-20 w-24 h-24 text-teal-600">
            <Sparkles className="w-full h-full" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🌿</span>
              <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900">
                Nutri<span className="text-emerald-600">Chef</span>
              </h1>
              <span className="text-4xl">🍲</span>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your <span className="font-bold text-emerald-600">AI-powered cooking companion</span> that turns 
              your ingredients into <span className="font-semibold">delicious recipes</span>, 
              creates <span className="font-semibold">personalized meal plans</span>, and makes cooking fun!
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                onClick={() => router.push('/register')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3"
              >
                <ChefHat className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Start Cooking Now
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-2xl font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Smart Recipe Search</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Tell me what ingredients you have, and I'll create amazing recipes just for you. 
                Filter by dietary preferences, cooking time, and difficulty level.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Meal Planning</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Get personalized weekly meal plans with nutritional information. 
                Perfect for busy schedules and healthy eating goals.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Nutrition Tracking</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Track calories, macros, and nutritional information for every recipe. 
                Make healthier choices with detailed insights.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-12 text-white text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-8">Join Thousands of Happy Cooks!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-emerald-100">Recipes Created</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-emerald-100">Happy Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">25K+</div>
                <div className="text-emerald-100">Meal Plans</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-emerald-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 bg-white/50 backdrop-blur-sm border-t border-emerald-100">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 NutriChef. Made with ❤️ for food lovers everywhere.</p>
        </div>
      </footer>
    </div>
    </main>
  );
}