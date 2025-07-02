'use client';

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { ChefHat, Mail, Lock, Check, ArrowRight, Loader2, AlertCircle, X, ArrowLeft, Info } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { strength: number; feedback: string } => {
    if (!pwd) return { strength: 0, feedback: "Password is required" };
    if (pwd.length < 6) return { strength: 1, feedback: "Password is too short" };
    
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    let feedback = "";
    switch (strength) {
      case 0: feedback = "Very weak"; break;
      case 1: feedback = "Weak"; break;
      case 2: feedback = "Medium"; break;
      case 3: feedback = "Strong"; break;
      case 4: feedback = "Very strong"; break;
    }
    
    return { strength: strength + 1, feedback };
  };
  
  const passwordStrengthInfo = getPasswordStrength(password);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Registration successful! Redirecting to your dashboard...');
      setTimeout(() => router.push('/chat'), 2000);
    } catch (err: any) {
      let errorMessage = 'Failed to register';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  // Optional: Google sign-up
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Dynamic Background with Food Image Overlay */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-800/80 to-emerald-700/80"></div>
        
        {/* Floating Food Elements */}
        <div className="absolute top-20 right-10 w-16 h-16 text-white/10 animate-float">
          <ChefHat className="w-full h-full" />
        </div>
        <div className="absolute top-40 left-20 w-20 h-20 text-white/10 animate-float delay-1000">
          <ChefHat className="w-full h-full" />
        </div>
        <div className="absolute bottom-40 right-1/4 w-24 h-24 text-white/10 animate-float delay-2000">
          <ChefHat className="w-full h-full" />
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 text-white hover:text-emerald-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Register Form Card */}
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
              <h1 className="text-3xl font-bold text-white text-center mt-4">Join NutriChef</h1>
              <p className="text-emerald-100 text-center mt-2">Create your account to get started</p>
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

              {success && (
                <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-fade-in">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                    Password
                  </label>
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
                      minLength={6}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <span className="text-xs">Hide</span>
                        ) : (
                          <span className="text-xs">Show</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              passwordStrengthInfo.strength <= 1 ? 'bg-red-500' :
                              passwordStrengthInfo.strength === 2 ? 'bg-orange-500' :
                              passwordStrengthInfo.strength === 3 ? 'bg-yellow-500' :
                              passwordStrengthInfo.strength === 4 ? 'bg-green-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${passwordStrengthInfo.strength * 20}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{passwordStrengthInfo.feedback}</span>
                      </div>
                      
                      {passwordStrengthInfo.strength <= 2 && (
                        <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <p>For a stronger password, use at least 8 characters with upper and lowercase letters, numbers, and symbols</p>
                        </div>
                      )}
                    </div>
                  )}
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
                        Create Account
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
                    <span className="px-2 bg-white text-gray-500">or sign up with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-gray-700">Google</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors"
                    disabled={isSubmitting}
                  >
                    Sign in
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
