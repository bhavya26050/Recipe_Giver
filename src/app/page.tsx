'use client';

import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { ChefHat, Star, Heart, Clock, Utensils, Sparkles, Users, Trophy, Play, Calendar, ArrowRight, Zap, Shield, Award } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { name: "Sarah M.", text: "NutriChef changed how I cook! Amazing recipes from simple ingredients.", rating: 5 },
    { name: "Mike R.", text: "Perfect meal planning feature. Saved me hours every week!", rating: 5 },
    { name: "Emma L.", text: "The nutrition tracking is so helpful for my fitness goals.", rating: 5 }
  ];

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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="text-center">
          <div className="relative">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-emerald-600 animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading NutriChef...</p>
          <div className="mt-4 w-32 h-2 bg-emerald-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Enhanced Header with Parallax Effect */}
      <header className="relative z-20 px-6 py-4 backdrop-blur-md bg-white/80 shadow-sm border-b border-emerald-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
              <ChefHat className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                NutriChef
              </h1>
              <p className="text-xs text-gray-500 font-medium">AI Recipe Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-all hover:scale-105 relative group"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-emerald-100 rounded-lg scale-0 group-hover:scale-100 transition-transform"></div>
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center gap-2 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section with Enhanced Background */}
      <main className="relative">
        {/* Dynamic Background with Food Image Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(1px)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-green-50/90 to-teal-50/90"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 text-emerald-600/30 animate-pulse">
            <Utensils className="w-full h-full" />
          </div>
          <div className="absolute top-40 right-20 w-16 h-16 text-green-600/30 animate-pulse delay-1000">
            <Heart className="w-full h-full" />
          </div>
          <div className="absolute bottom-40 left-20 w-24 h-24 text-teal-600/30 animate-pulse delay-2000">
            <Sparkles className="w-full h-full" />
          </div>
          
          {/* Animated Circles */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-200/40 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-green-200/40 rounded-full animate-float delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Enhanced Hero Content */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up">
              <span className="text-5xl animate-bounce">🌿</span>
              <h1 className="text-6xl md:text-8xl font-extrabold">
                <span className="bg-gradient-to-r from-gray-900 via-emerald-700 to-green-600 bg-clip-text text-transparent">
                  Nutri
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Chef
                </span>
              </h1>
              <span className="text-5xl animate-bounce delay-500">🍲</span>
            </div>
            
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              Transform your kitchen into a 
              <span className="font-bold text-emerald-600 relative group mx-2">
                culinary adventure
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-emerald-600 group-hover:w-full transition-all duration-500"></span>
              </span> 
              with AI-powered recipes, smart meal planning, and nutritional insights!
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-sm text-gray-600 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">4.9/5 Rating (2.1k reviews)</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">50K+ Active Users</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up delay-400">
              <button
                onClick={() => router.push('/register')}
                className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center gap-4 relative overflow-hidden"
              >
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform z-10" />
                <span className="z-10">Start Cooking Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform z-10" />
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="group px-10 py-5 bg-white/90 backdrop-blur-sm border-2 border-emerald-600 text-emerald-700 rounded-2xl font-bold text-xl hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 relative overflow-hidden"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
                <div className="absolute inset-0 bg-emerald-600/5 transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </button>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="mb-20">
            <h2 className="text-5xl font-bold text-center text-gray-900 mb-4 animate-fade-in-up">
              Why Choose <span className="text-emerald-600">NutriChef</span>?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              Discover the features that make cooking easier, healthier, and more enjoyable than ever before.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Utensils,
                  title: "Smart Recipe Discovery",
                  description: "Just tell me what ingredients you have, and I'll create personalized recipes with step-by-step instructions, cooking tips, and dietary adaptations.",
                  color: "from-emerald-500 to-green-600",
                  stats: "10M+ recipes"
                },
                {
                  icon: Clock,
                  title: "Intelligent Meal Planning",
                  description: "Get AI-generated weekly meal plans tailored to your preferences, schedule, and nutritional goals. Never wonder 'what's for dinner?' again!",
                  color: "from-blue-500 to-cyan-600",
                  stats: "Save 5hrs/week"
                },
                {
                  icon: Heart,
                  title: "Nutrition Intelligence",
                  description: "Track calories, macros, vitamins, and minerals with detailed nutritional breakdowns. Make informed choices for a healthier lifestyle.",
                  color: "from-purple-500 to-pink-600",
                  stats: "99% accuracy"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-emerald-100/50 relative overflow-hidden"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div className="text-center">
                      <div className={`inline-block px-3 py-1 bg-gradient-to-r ${feature.color} text-white text-sm font-medium rounded-full mb-4`}>
                        {feature.stats}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Testimonials Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              What Our <span className="text-emerald-600">Community</span> Says
            </h2>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-emerald-100 relative overflow-hidden">
              <div className="text-center max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-2xl text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                    <p className="text-gray-500 text-sm">Verified User</p>
                  </div>
                </div>

                {/* Testimonial indicators */}
                <div className="flex justify-center mt-8 gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial ? 'bg-emerald-500 scale-125' : 'bg-gray-300 hover:bg-emerald-300'
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-16 text-white text-center shadow-2xl mb-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-emerald-600/30 animate-pulse"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Join the Culinary Revolution!</h2>
              <p className="text-emerald-100 text-xl mb-12 max-w-2xl mx-auto">
                Thousands of home cooks have already transformed their kitchens with NutriChef
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  {
                    icon: Utensils,
                    number: "2.5M+",
                    label: "Recipes Created",
                    color: "text-emerald-200"
                  },
                  {
                    icon: Users,
                    number: "50K+",
                    label: "Active Users",
                    color: "text-green-200"
                  },
                  {
                    icon: Calendar,
                    number: "100K+",
                    label: "Meal Plans",
                    color: "text-teal-200"
                  },
                  {
                    icon: Award,
                    number: "4.9/5",
                    label: "User Rating",
                    color: "text-yellow-200"
                  }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="group">
                      <div className="bg-white/20 rounded-2xl p-6 group-hover:bg-white/30 transition-all transform group-hover:scale-105">
                        <Icon className={`w-8 h-8 mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                        <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                        <div className="text-emerald-100 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center animate-fade-in-up">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Ready to Cook Like a Pro?
            </h2>
            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of happy home cooks and start your culinary journey today.
              <span className="block text-emerald-600 font-semibold mt-2">No credit card required!</span>
            </p>
            <button
              onClick={() => router.push('/register')}
              className="group px-16 py-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center gap-4 mx-auto relative overflow-hidden"
            >
              <ChefHat className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span>Start Your Journey</span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 px-6 bg-gradient-to-r from-emerald-900 to-green-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-600/30">
                  <ChefHat className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">NutriChef</h3>
                  <p className="text-emerald-200 text-sm">AI Recipe Assistant</p>
                </div>
              </div>
              <p className="text-emerald-100 leading-relaxed">
                NutriChef helps you discover, plan, and track your meals with ease.
              </p>
            </div>
            {[
              {
                title: "Features",
                links: ["Recipe Search", "Meal Planning", "Nutrition Tracking", "Smart Suggestions"]
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"]
              },
              {
                title: "Support",
                links: ["Help Center", "Community", "Blog", "API Docs"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-6 text-emerald-300 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-emerald-100 hover:text-white transition-colors hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-emerald-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-emerald-200 mb-4 md:mb-0">
              &copy; 2024 NutriChef. Made with ❤️ for food lovers everywhere.
            </p>
            <div className="flex gap-6">
              <span className="text-emerald-300">Follow us:</span>
              {['Twitter', 'Instagram', 'Facebook'].map((social, index) => (
                <a key={index} href="#" className="text-emerald-200 hover:text-white transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </div>
  );
}