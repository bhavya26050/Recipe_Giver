'use client';

import { signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { ChefHat, Mail, Lock, ArrowRight, Loader2, AlertCircle, X, ArrowLeft } from 'lucide-react';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/chat');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/chat');
    } catch (err: any) {
      let errorMessage = 'Failed to sign in';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid login credentials';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  // Optional: Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address above to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send password reset email.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
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
    <main className="min-h-screen flex flex-col relative">
      {/* Dynamic Background with Food Image Overlay */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-800/80 to-emerald-700/80"></div>
        
        {/* Floating Food Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 text-white/10 animate-float">
          <ChefHat className="w-full h-full" />
        </div>
        <div className="absolute top-40 right-20 w-20 h-20 text-white/10 animate-float delay-1000">
          <ChefHat className="w-full h-full" />
        </div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 text-white/10 animate-float delay-2000">
          <ChefHat className="w-full h-full" />
        </div>
      </div>

      {/* Back to Home Button - Fixed Z-Index */}
      <div className="absolute top-6 left-6 z-50"> {/* Changed from z-10 to z-50 */}
        <button 
          onClick={() => {
            console.log('Back to Home button clicked'); // Debug log
            try {
              router.push('/');
            } catch (error) {
              console.error('Navigation error:', error);
              // Fallback: Use window.location if router fails
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-white hover:text-emerald-200 transition-colors cursor-pointer"
          style={{ zIndex: 9999 }} // Additional inline style for extra safety
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Login Form Card */}
      <div className="flex-grow flex items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 pt-12 pb-10">
              <div className="flex justify-center">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mt-4">Welcome Back</h1>
              <p className="text-emerald-100 text-center mt-2">Log in to your NutriChef account</p>
            </div>

            {/* Card Body */}
            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => setError('')} 
                    className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-12 pr-4 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium" htmlFor="password">
                      Password
                    </label>
                    <button 
                      type="button"
                      className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <span className="text-xs">Hide</span>
                        ) : (
                          <span className="text-xs">Show</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl  transition-all transform hover:-translate-y-1 cursor-pointer bg-white hover:bg-gray-200 "
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-gray-700">Google</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  New to NutriChef?{' '}
                  <button
                    onClick={() => router.push('/register')}
                    className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-white/70 text-sm z-10">
        <p>© 2024 NutriChef. All rights reserved.</p>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </main>
  );
}
