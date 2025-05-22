// // // // // // // export default function LoginPage() {
// // // // // // //   return (
// // // // // // //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
// // // // // // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // // // // // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
// // // // // // //         <form className="space-y-4">
// // // // // // //           <input type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded" />
// // // // // // //           <input type="password" placeholder="Password" className="w-full p-2 border border-gray-300 rounded" />
// // // // // // //           <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
// // // // // // //             Login
// // // // // // //           </button>
// // // // // // //         </form>
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }

// // // // // // 'use client';

// // // // // // import { useState } from 'react';
// // // // // // import { useRouter } from 'next/navigation';

// // // // // // export default function LoginPage() {
// // // // // //   const router = useRouter();
// // // // // //   const [email, setEmail] = useState('');
// // // // // //   const [password, setPassword] = useState('');

// // // // // //   const handleLogin = (e: React.FormEvent) => {
// // // // // //     e.preventDefault();

// // // // // //     // Dummy login — replace with Firebase/Auth
// // // // // //     if (email && password) {
// // // // // //       router.push('/chat');
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// // // // // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // // // // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

// // // // // //         <form onSubmit={handleLogin} className="space-y-4">
// // // // // //           <input
// // // // // //             type="email"
// // // // // //             placeholder="Email"
// // // // // //             className="w-full p-2 border border-gray-300 rounded"
// // // // // //             value={email}
// // // // // //             onChange={(e) => setEmail(e.target.value)}
// // // // // //             required
// // // // // //           />
// // // // // //           <input
// // // // // //             type="password"
// // // // // //             placeholder="Password"
// // // // // //             className="w-full p-2 border border-gray-300 rounded"
// // // // // //             value={password}
// // // // // //             onChange={(e) => setPassword(e.target.value)}
// // // // // //             required
// // // // // //           />
// // // // // //           <button
// // // // // //             type="submit"
// // // // // //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// // // // // //           >
// // // // // //             Login
// // // // // //           </button>
// // // // // //         </form>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // 'use client';

// // // // // import { useState } from 'react';
// // // // // import { signInWithEmailAndPassword } from 'firebase/auth';
// // // // // import { auth } from '@/firebase/firebaseConfig';
// // // // // import { useRouter } from 'next/navigation';

// // // // // export default function LoginPage() {
// // // // //   const router = useRouter();
// // // // //   const [email, setEmail] = useState('');
// // // // //   const [password, setPassword] = useState('');
// // // // //   const [error, setError] = useState('');

// // // // //   const handleLogin = async (e: React.FormEvent) => {
// // // // //     e.preventDefault();

// // // // //     try {
// // // // //       await signInWithEmailAndPassword(auth, email, password);
// // // // //       router.push('/chat');
// // // // //     } catch (err: any) {
// // // // //       setError(err.message || 'Login failed');
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// // // // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // // // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

// // // // //         {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

// // // // //         <form onSubmit={handleLogin} className="space-y-4">
// // // // //           <input
// // // // //             type="email"
// // // // //             placeholder="Email"
// // // // //             className="w-full p-2 border border-gray-300 rounded"
// // // // //             value={email}
// // // // //             onChange={(e) => setEmail(e.target.value)}
// // // // //             required
// // // // //           />
// // // // //           <input
// // // // //             type="password"
// // // // //             placeholder="Password"
// // // // //             className="w-full p-2 border border-gray-300 rounded"
// // // // //             value={password}
// // // // //             onChange={(e) => setPassword(e.target.value)}
// // // // //             required
// // // // //           />
// // // // //           <button
// // // // //             type="submit"
// // // // //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// // // // //           >
// // // // //             Login
// // // // //           </button>
// // // // //         </form>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // 'use client';

// // // // import { useState } from 'react';
// // // // import { useRouter } from 'next/navigation';
// // // // import { signInWithEmailAndPassword } from 'firebase/auth';
// // // // import { auth } from '@/firebase/firebaseConfig';

// // // // export default function LoginPage() {
// // // //   const router = useRouter();
// // // //   const [email, setEmail] = useState('');
// // // //   const [password, setPassword] = useState('');
// // // //   const [error, setError] = useState('');

// // // //   const handleLogin = async (e: React.FormEvent) => {
// // // //     e.preventDefault();

// // // //     try {
// // // //       await signInWithEmailAndPassword(auth, email, password);
// // // //       router.push('/chat'); // Redirect after login
// // // //     } catch (err: any) {
// // // //       setError(err.message || 'Login failed');
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400 px-4">
// // // //       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
// // // //         <h2 className="text-3xl font-bold text-center text-green-800 mb-6">NutriChef Login</h2>

// // // //         {error && <p className="mb-4 text-red-600 text-sm text-center">{error}</p>}

// // // //         <form onSubmit={handleLogin} className="space-y-4">
// // // //           <input
// // // //             type="email"
// // // //             placeholder="Email"
// // // //             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
// // // //             value={email}
// // // //             onChange={(e) => setEmail(e.target.value)}
// // // //             required
// // // //           />
// // // //           <input
// // // //             type="password"
// // // //             placeholder="Password"
// // // //             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
// // // //             value={password}
// // // //             onChange={(e) => setPassword(e.target.value)}
// // // //             required
// // // //           />
// // // //           <button
// // // //             type="submit"
// // // //             className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
// // // //           >
// // // //             Log In
// // // //           </button>
// // // //         </form>

// // // //         <p className="text-sm text-center mt-4 text-gray-600">
// // // //           Don't have an account?{' '}
// // // //           <a href="/register" className="text-green-700 hover:underline">
// // // //             Register here
// // // //           </a>
// // // //         </p>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // 'use client';

// // // // import { signInWithEmailAndPassword } from 'firebase/auth';
// // // // import { useRouter } from 'next/navigation';
// // // // import { useState } from 'react';
// // // // import { auth } from '@/firebase/firebaseConfig';

// // // // export default function LoginPage() {
// // // //   const router = useRouter();
// // // //   const [email, setEmail] = useState('');
// // // //   const [password, setPassword] = useState('');
// // // //   const [error, setError] = useState('');

// // // //   const handleLogin = async (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     try {
// // // //       await signInWithEmailAndPassword(auth, email, password);
// // // //       router.push('/chat');
// // // //     } catch (err: any) {
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen flex items-center justify-center bg-green-50">
// // // //       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
// // // //         <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h1>
// // // //         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
// // // //         <form onSubmit={handleLogin} className="space-y-4">
// // // //           <input
// // // //             type="email"
// // // //             placeholder="Email"
// // // //             className="w-full p-3 border border-gray-300 rounded-lg"
// // // //             value={email}
// // // //             onChange={(e) => setEmail(e.target.value)}
// // // //             required
// // // //           />
// // // //           <input
// // // //             type="password"
// // // //             placeholder="Password"
// // // //             className="w-full p-3 border border-gray-300 rounded-lg"
// // // //             value={password}
// // // //             onChange={(e) => setPassword(e.target.value)}
// // // //             required
// // // //           />
// // // //           <button
// // // //             type="submit"
// // // //             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
// // // //           >
// // // //             Login
// // // //           </button>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // 'use client';

// // // // import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// // // // import { useRouter } from 'next/navigation';
// // // // import { useEffect, useState } from 'react';
// // // // import { auth } from '@/firebase/firebaseConfig';

// // // // export default function LoginPage() {
// // // //   const router = useRouter();
// // // //   const [email, setEmail] = useState('');
// // // //   const [password, setPassword] = useState('');
// // // //   const [error, setError] = useState('');
// // // //   const [loading, setLoading] = useState(true);

// // // //   // Redirect to /chat if user is already logged in
// // // //   useEffect(() => {
// // // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // // //       if (user) {
// // // //         router.push('/chat');
// // // //       } else {
// // // //         setLoading(false); // Only show login form if not logged in
// // // //       }
// // // //     });
// // // //     return () => unsubscribe();
// // // //   }, []);

// // // //   const handleLogin = async (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     try {
// // // //       await signInWithEmailAndPassword(auth, email, password);
// // // //       router.push('/chat');
// // // //     } catch (err: any) {
// // // //       setError(err.message);
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return <p className="text-center mt-10">Checking authentication...</p>;
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen flex items-center justify-center bg-green-50">
// // // //       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
// // // //         <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h1>
// // // //         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
// // // //         <form onSubmit={handleLogin} className="space-y-4">
// // // //           <input
// // // //             type="email"
// // // //             placeholder="Email"
// // // //             className="w-full p-3 border border-gray-300 rounded-lg"
// // // //             value={email}
// // // //             onChange={(e) => setEmail(e.target.value)}
// // // //             required
// // // //           />
// // // //           <input
// // // //             type="password"
// // // //             placeholder="Password"
// // // //             className="w-full p-3 border border-gray-300 rounded-lg"
// // // //             value={password}
// // // //             onChange={(e) => setPassword(e.target.value)}
// // // //             required
// // // //           />
// // // //           <button
// // // //             type="submit"
// // // //             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
// // // //           >
// // // //             Login
// // // //           </button>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // 'use client';

// // // import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// // // import { useRouter } from 'next/navigation';
// // // import { useEffect, useState } from 'react';
// // // import { auth } from '@/firebase/firebaseConfig';

// // // export default function LoginPage() {
// // //   const router = useRouter();
// // //   const [email, setEmail] = useState('');
// // //   const [password, setPassword] = useState('');
// // //   const [error, setError] = useState('');
// // //   const [loading, setLoading] = useState(true);

// // //   // Redirect to /chat if user is already logged in
// // //   useEffect(() => {
// // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // //       if (user) {
// // //         router.push('/chat');
// // //       } else {
// // //         setLoading(false); // Only show login form if not logged in
// // //       }
// // //     });
// // //     return () => unsubscribe();
// // //   }, [router]);

// // //   const handleLogin = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     try {
// // //       await signInWithEmailAndPassword(auth, email, password);
// // //       router.push('/chat');
// // //     } catch (err: any) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return <p className="text-center mt-10 text-green-700 font-semibold">Checking authentication...</p>;
// // //   }

// // //   return (
// // //     <main
// // //       className="min-h-screen flex items-center justify-center px-6 py-12"
// // //       style={{
// // //         backgroundImage:
// // //           "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80')",
// // //         backgroundSize: 'cover',
// // //         backgroundPosition: 'center',
// // //       }}
// // //     >
// // //       <section className="bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col">
// // //         <h1 className="text-4xl font-extrabold mb-8 text-emerald-700 text-center">Welcome Back! 🍲</h1>

// // //         {error && (
// // //           <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow-sm">
// // //             {error}
// // //           </div>
// // //         )}

// // //         <form onSubmit={handleLogin} className="flex flex-col gap-6">
// // //           <input
// // //             type="email"
// // //             placeholder="Email address"
// // //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// // //             value={email}
// // //             onChange={(e) => setEmail(e.target.value)}
// // //             required
// // //             autoComplete="email"
// // //           />
// // //           <input
// // //             type="password"
// // //             placeholder="Password"
// // //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// // //             value={password}
// // //             onChange={(e) => setPassword(e.target.value)}
// // //             required
// // //             autoComplete="current-password"
// // //           />
// // //           <button
// // //             type="submit"
// // //             className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1"
// // //           >
// // //             Login
// // //           </button>
// // //         </form>

// // //         <p className="mt-8 text-center text-gray-600">
// // //           New here?{' '}
// // //           <span
// // //             className="text-emerald-600 font-semibold cursor-pointer hover:underline"
// // //             onClick={() => router.push('/register')}
// // //           >
// // //             Create an account
// // //           </span>
// // //         </p>
// // //       </section>
// // //     </main>
// // //   );
// // // }
// // // 'use client';

// // // import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// // // import { useRouter } from 'next/navigation';
// // // import { useEffect, useState } from 'react';
// // // import { auth } from '@/firebase/firebaseConfig';

// // // export default function LoginPage() {
// // //   const router = useRouter();
// // //   const [email, setEmail] = useState('');
// // //   const [password, setPassword] = useState('');
// // //   const [error, setError] = useState('');
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // //       if (user) {
// // //         router.push('/chat');
// // //       } else {
// // //         setLoading(false);
// // //       }
// // //     });
// // //     return () => unsubscribe();
// // //   }, [router]);

// // //   const handleLogin = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     try {
// // //       await signInWithEmailAndPassword(auth, email, password);
// // //       router.push('/chat');
// // //     } catch (err: any) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return <p className="text-center mt-10 text-green-700 font-semibold">Checking authentication...</p>;
// // //   }

// // //   return (
// // //     <main
// // //       className="min-h-screen flex items-center justify-center px-6 py-12"
// // //       style={{
// // //         backgroundImage:
// // //           "url('https://images.unsplash.com/photo-1514516873081-56a0649dc9e8?auto=format&fit=crop&w=1470&q=80')",
// // //         backgroundSize: 'cover',
// // //         backgroundPosition: 'center',
// // //       }}
// // //     >
// // //       <section className="bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col">
// // //         <h1 className="text-4xl font-extrabold mb-8 text-emerald-700 text-center">Welcome Back! 🍲</h1>

// // //         {error && (
// // //           <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow-sm">
// // //             {error}
// // //           </div>
// // //         )}

// // //         <form onSubmit={handleLogin} className="flex flex-col gap-6">
// // //           <input
// // //             type="email"
// // //             placeholder="Email address"
// // //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// // //             value={email}
// // //             onChange={(e) => setEmail(e.target.value)}
// // //             required
// // //             autoComplete="email"
// // //           />
// // //           <input
// // //             type="password"
// // //             placeholder="Password"
// // //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// // //             value={password}
// // //             onChange={(e) => setPassword(e.target.value)}
// // //             required
// // //             autoComplete="current-password"
// // //           />
// // //           <button
// // //             type="submit"
// // //             className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1"
// // //           >
// // //             Login
// // //           </button>
// // //         </form>

// // //         <p className="mt-8 text-center text-gray-600">
// // //           New here?{' '}
// // //           <span
// // //             className="text-emerald-600 font-semibold cursor-pointer hover:underline"
// // //             onClick={() => router.push('/register')}
// // //           >
// // //             Create an account
// // //           </span>
// // //         </p>
// // //       </section>
// // //     </main>
// // //   );
// // // }
// // 'use client';

// // import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// // import { useRouter } from 'next/navigation';
// // import { useEffect, useState } from 'react';
// // import { auth } from '@/firebase/firebaseConfig';

// // export default function LoginPage() {
// //   const router = useRouter();
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// //       if (user) {
// //         router.push('/chat');
// //       } else {
// //         setLoading(false);
// //       }
// //     });
// //     return () => unsubscribe();
// //   }, [router]);

// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       await signInWithEmailAndPassword(auth, email, password);
// //       router.push('/chat');
// //     } catch (err: any) {
// //       setError(err.message);
// //     }
// //   };

// //   if (loading) {
// //     return <p className="text-center mt-10 text-green-700 font-semibold">Checking authentication...</p>;
// //   }

// //   return (
// //     <main
// //       className="min-h-screen flex items-center justify-center px-6 py-12 relative"
// //       style={{
// //         backgroundImage:
// //           "url('https://images.unsplash.com/photo-1514516873081-56a0649dc9e8?auto=format&fit=crop&w=1470&q=80')",
// //         backgroundSize: 'cover',
// //         backgroundPosition: 'center',
// //       }}
// //     >
// //       {/* Overlay gradient for better contrast */}
// //       <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-700/70 to-green-600/80 z-0"></div>

// //       <section className="relative z-10 bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center">
// //         {/* Chef hat icon */}
// //         <img
// //           src="https://img.icons8.com/fluency/96/000000/chef-hat.png"
// //           alt="Chef hat icon"
// //           className="mb-6"
// //           width={80}
// //           height={80}
// //           loading="lazy"
// //         />

// //         <h1 className="text-4xl font-extrabold mb-8 text-emerald-700 text-center">Welcome Back! 🍲</h1>

// //         {error && (
// //           <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow-sm w-full">
// //             {error}
// //           </div>
// //         )}

// //         <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
// //           <input
// //             type="email"
// //             placeholder="Email address"
// //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //             autoComplete="email"
// //           />
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //             autoComplete="current-password"
// //           />
// //           <button
// //             type="submit"
// //             className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1"
// //           >
// //             Login
// //           </button>
// //         </form>

// //         <p className="mt-8 text-center text-gray-600">
// //           New here?{' '}
// //           <span
// //             className="text-emerald-600 font-semibold cursor-pointer hover:underline"
// //             onClick={() => router.push('/register')}
// //           >
// //             Create an account
// //           </span>
// //         </p>
// //       </section>
// //     </main>
// //   );
// // }
// 'use client';

// import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { auth } from '@/firebase/firebaseConfig';

// const backgroundOptions = {
//   warmRustic:
//     "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')", // Cozy kitchen warm tone
//   freshFlatlay:
//     "url('https://images.unsplash.com/photo-1516685018646-54978f16322a?auto=format&fit=crop&w=1470&q=80')", // Colorful fresh veggies flatlay
//   minimalistArt:
//     "linear-gradient(135deg, #ffe5d4 0%, #ffdac1 100%)", // Warm pastel peach gradient
//   recipeNotebook:
//     "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1470&q=80')", // Notebook with recipe and ingredients
//   animatedPattern:
//     "url('https://www.transparenttextures.com/patterns/food.png')", // Food icon pattern (transparenttextures.com)
// };

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [bgStyle, setBgStyle] = useState('warmRustic');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         router.push('/chat');
//       } else {
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [router]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push('/chat');
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   if (loading) {
//     return <p className="text-center mt-10 text-emerald-700 font-semibold">Checking authentication...</p>;
//   }

//   return (
//     <main
//       className="min-h-screen flex items-center justify-center px-6 py-12 relative"
//       style={{
//         backgroundImage: backgroundOptions[bgStyle],
//         backgroundSize: bgStyle === 'minimalistArt' ? 'auto' : 'cover',
//         backgroundRepeat: bgStyle === 'animatedPattern' ? 'repeat' : 'no-repeat',
//         backgroundPosition: 'center',
//       }}
//     >
//       {/* Overlay gradient for better contrast and warmth */}
//       <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-700/70 to-amber-600/80 z-0"></div>

//       <section className="relative z-10 bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center">
//         <img
//           src="https://img.icons8.com/fluency/96/000000/chef-hat.png"
//           alt="Chef hat icon"
//           className="mb-6"
//           width={80}
//           height={80}
//           loading="lazy"
//         />

//         <h1 className="text-4xl font-extrabold mb-4 text-amber-700 text-center">Welcome Back! 🍲</h1>

//         <div className="mb-6 w-full">
//           <label htmlFor="bgSelect" className="block mb-2 font-semibold text-amber-700">
//             Choose background style:
//           </label>
//           <select
//             id="bgSelect"
//             value={bgStyle}
//             onChange={(e) => setBgStyle(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
//           >
//             <option value="warmRustic">Warm Rustic Kitchen Vibes</option>
//             <option value="freshFlatlay">Bright Fresh Ingredients Flatlay</option>
//             <option value="minimalistArt">Minimalist Modern Food Art</option>
//             <option value="recipeNotebook">Recipe Notebook & Ingredients</option>
//             <option value="animatedPattern">Animated / Illustrated Pattern</option>
//           </select>
//         </div>

//         {error && (
//           <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow-sm w-full">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
//           <input
//             type="email"
//             placeholder="Email address"
//             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             autoComplete="email"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             autoComplete="current-password"
//           />
//           <button
//             type="submit"
//             className="w-full py-4 bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:bg-amber-700 transition transform hover:-translate-y-1"
//           >
//             Login
//           </button>
//         </form>

//         <p className="mt-8 text-center text-gray-600">
//           New here?{' '}
//           <span
//             className="text-amber-600 font-semibold cursor-pointer hover:underline"
//             onClick={() => router.push('/register')}
//           >
//             Create an account
//           </span>
//         </p>
//       </section>
//     </main>
//   );
// }
'use client';

import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-green-700 font-semibold">Checking authentication...</p>;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12 relative"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/food.png')",
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay gradient for soft green contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-green-700/60 to-green-600/70 z-0"></div>

      <section className="relative z-10 bg-white bg-opacity-95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center">
        <img
          src="https://img.icons8.com/fluency/96/000000/chef-hat.png"
          alt="Chef hat icon"
          className="mb-6"
          width={80}
          height={80}
          loading="lazy"
        />

        <h1 className="text-4xl font-extrabold mb-4 text-green-700 text-center">Welcome Back! 🍲</h1>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow-sm w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
          <input
            type="email"
            placeholder="Email address"
            className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition transform hover:-translate-y-1"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          New here?{' '}
          <span
            className="text-green-600 font-semibold cursor-pointer hover:underline"
            onClick={() => router.push('/register')}
          >
            Create an account
          </span>
        </p>
      </section>
    </main>
  );
}
