'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { ChefHat, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Validate the oobCode
    if (mode === 'resetPassword' && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(email => {
          setEmail(email);
          setLoading(false);
        })
        .catch(() => {
          setError('This password reset link is invalid or has expired.');
          setLoading(false);
        });
    } else {
      setError('Invalid password reset link.');
      setLoading(false);
    }
  }, [mode, oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setSuccess('Your password has been reset! You can now log in with your new password.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError('Failed to reset password. The link may have expired or the password is invalid.');
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 relative">
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-800/80 to-emerald-700/80"></div>
      </div>
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-100 p-3 rounded-2xl mb-2">
            <ChefHat className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700 mb-1">Reset Your Password</h1>
          <p className="text-gray-500 text-center">
            {loading ? 'Validating your reset link...' : email ? `for ${email}` : ''}
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <p className="text-emerald-700 text-center">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  className="pl-12 pr-4 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-12 pr-4 py-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/70 backdrop-blur-sm"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-700 hover:to-green-700 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Reset Password</>
              )}
            </button>
          </form>
        )}
      </div>
      <footer className="py-6 px-8 text-center text-white/70 text-sm z-10">
        <p>© 2024 NutriChef. All rights reserved.</p>
      </footer>
    </main>
  );
}