// // // 'use client';

// // // import { useState } from 'react';
// // // import { useRouter } from 'next/navigation';

// // // export default function RegisterPage() {
// // //   const router = useRouter();
// // //   const [email, setEmail] = useState('');
// // //   const [password, setPassword] = useState('');
// // //   const [confirmPassword, setConfirmPassword] = useState('');
// // //   const [error, setError] = useState('');

// // //   const handleRegister = (e: React.FormEvent) => {
// // //     e.preventDefault();

// // //     if (password !== confirmPassword) {
// // //       setError("Passwords do not match");
// // //       return;
// // //     }

// // //     // Simulate a successful registration (replace this with Firebase/API later)
// // //     console.log('User Registered:', { email, password });

// // //     setError('');
// // //     router.push('/login'); // redirect after successful register
// // //   };

// // //   return (
// // //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// // //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// // //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>

// // //         {error && (
// // //           <p className="mb-4 text-red-500 text-sm text-center">{error}</p>
// // //         )}

// // //         <form onSubmit={handleRegister} className="space-y-4">
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

// // //           <input
// // //             type="password"
// // //             placeholder="Confirm Password"
// // //             className="w-full p-2 border border-gray-300 rounded"
// // //             value={confirmPassword}
// // //             onChange={(e) => setConfirmPassword(e.target.value)}
// // //             required
// // //           />

// // //           <button
// // //             type="submit"
// // //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// // //           >
// // //             Register
// // //           </button>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // 'use client';

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';

// // export default function RegisterPage() {
// //   const router = useRouter();
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [confirmPassword, setConfirmPassword] = useState('');
// //   const [error, setError] = useState('');

// //   const handleRegister = (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (password !== confirmPassword) {
// //       setError("Passwords do not match");
// //       return;
// //     }

// //     setError('');
// //     router.push('/login'); // redirect after register
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
// //       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
// //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>

// //         {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

// //         <form onSubmit={handleRegister} className="space-y-4">
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
// //           <input
// //             type="password"
// //             placeholder="Confirm Password"
// //             className="w-full p-2 border border-gray-300 rounded"
// //             value={confirmPassword}
// //             onChange={(e) => setConfirmPassword(e.target.value)}
// //             required
// //           />
// //           <button
// //             type="submit"
// //             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
// //           >
// //             Register
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '@/firebase/firebaseConfig';

// export default function RegisterPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       setError('');
//       router.push('/login'); // Redirect after successful registration
//     } catch (err: any) {
//       setError(err.message || 'Registration failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
//         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>

//         {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

//         <form onSubmit={handleRegister} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full p-2 border border-gray-300 rounded"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-2 border border-gray-300 rounded"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             className="w-full p-2 border border-gray-300 rounded"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
'use client';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Register</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
