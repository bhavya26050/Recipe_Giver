// // // // export default function LoginPage() {
// // // //   return (
// // // //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
// // // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
// // // //         <form className="space-y-4">
// // // //           <input type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded" />
// // // //           <input type="password" placeholder="Password" className="w-full p-2 border border-gray-300 rounded" />
// // // //           <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
// // // //             Login
// // // //           </button>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // 'use client';

// // // import { useState } from 'react';
// // // import { useRouter } from 'next/navigation';

// // // export default function LoginPage() {
// // //   const router = useRouter();
// // //   const [email, setEmail] = useState('');
// // //   const [password, setPassword] = useState('');

// // //   const handleLogin = (e: React.FormEvent) => {
// // //     e.preventDefault();

// // //     // Dummy login — replace with Firebase/Auth
// // //     if (email && password) {
// // //       router.push('/chat');
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

// // //         <form onSubmit={handleLogin} className="space-y-4">
// // //           <input
// // //             type="email"
// // //             placeholder="Email"
// // //             className="w-full p-2 border border-gray-300 rounded"
// // //             value={email}
// // //             onChange={(e) => setEmail(e.target.value)}
// // //             required
// // //           />
// // //           <input
// // //             type="password"
// // //             placeholder="Password"
// // //             className="w-full p-2 border border-gray-300 rounded"
// // //             value={password}
// // //             onChange={(e) => setPassword(e.target.value)}
// // //             required
// // //           />
// // //           <button
// // //             type="submit"
// // //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// // //           >
// // //             Login
// // //           </button>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // 'use client';

// // import { useState } from 'react';
// // import { signInWithEmailAndPassword } from 'firebase/auth';
// // import { auth } from '@/firebase/firebaseConfig';
// // import { useRouter } from 'next/navigation';

// // export default function LoginPage() {
// //   const router = useRouter();
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');

// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     try {
// //       await signInWithEmailAndPassword(auth, email, password);
// //       router.push('/chat');
// //     } catch (err: any) {
// //       setError(err.message || 'Login failed');
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

// //         {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

// //         <form onSubmit={handleLogin} className="space-y-4">
// //           <input
// //             type="email"
// //             placeholder="Email"
// //             className="w-full p-2 border border-gray-300 rounded"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //           />
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             className="w-full p-2 border border-gray-300 rounded"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //           <button
// //             type="submit"
// //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// //           >
// //             Login
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '@/firebase/firebaseConfig';

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push('/chat'); // Redirect after login
//     } catch (err: any) {
//       setError(err.message || 'Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400 px-4">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
//         <h2 className="text-3xl font-bold text-center text-green-800 mb-6">NutriChef Login</h2>

//         {error && <p className="mb-4 text-red-600 text-sm text-center">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
//           >
//             Log In
//           </button>
//         </form>

//         <p className="text-sm text-center mt-4 text-gray-600">
//           Don't have an account?{' '}
//           <a href="/register" className="text-green-700 hover:underline">
//             Register here
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
// 'use client';

// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { auth } from '@/firebase/firebaseConfig';

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push('/chat');
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-green-50">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
//         <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h1>
//         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
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

  // Redirect to /chat if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/chat');
      } else {
        setLoading(false); // Only show login form if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

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
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
