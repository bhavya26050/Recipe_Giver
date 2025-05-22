// // // // // // // // 'use client';

// // // // // // // // import { useState } from 'react';

// // // // // // // // export default function ChatPage() {
// // // // // // // //   const [message, setMessage] = useState('');
// // // // // // // //   const [chat, setChat] = useState<string[]>([]);

// // // // // // // //   const sendMessage = () => {
// // // // // // // //     if (message.trim()) {
// // // // // // // //       setChat([...chat, `You: ${message}`]);
// // // // // // // //       setMessage('');
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gray-50">
// // // // // // // //       <div className="w-full max-w-2xl bg-white p-4 shadow rounded flex-1 overflow-y-auto">
// // // // // // // //         {chat.map((msg, index) => (
// // // // // // // //           <div key={index} className="mb-2 text-gray-800">{msg}</div>
// // // // // // // //         ))}
// // // // // // // //       </div>
// // // // // // // //       <div className="w-full max-w-2xl mt-4 flex">
// // // // // // // //         <input
// // // // // // // //           type="text"
// // // // // // // //           value={message}
// // // // // // // //           onChange={(e) => setMessage(e.target.value)}
// // // // // // // //           className="flex-1 p-2 border border-gray-300 rounded-l"
// // // // // // // //           placeholder="Type your message..."
// // // // // // // //         />
// // // // // // // //         <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600">
// // // // // // // //           Send
// // // // // // // //         </button>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }
// // // // // // // 'use client';

// // // // // // // import { useState } from 'react';

// // // // // // // export default function ChatPage() {
// // // // // // //   const [message, setMessage] = useState('');
// // // // // // //   const [chat, setChat] = useState<string[]>([]);

// // // // // // //   const sendMessage = () => {
// // // // // // //     if (message.trim()) {
// // // // // // //       // Dummy chatbot reply – replace with backend API call
// // // // // // //       setChat([...chat, `You: ${message}`, `NutriChef: Here's a recipe based on "${message}"`]);
// // // // // // //       setMessage('');
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
// // // // // // //       <div className="w-full max-w-2xl bg-white p-4 shadow rounded flex-1 overflow-y-auto mb-4">
// // // // // // //         {chat.map((msg, idx) => (
// // // // // // //           <div key={idx} className="mb-2 text-gray-800">{msg}</div>
// // // // // // //         ))}
// // // // // // //       </div>
// // // // // // //       <div className="w-full max-w-2xl flex">
// // // // // // //         <input
// // // // // // //           type="text"
// // // // // // //           value={message}
// // // // // // //           onChange={(e) => setMessage(e.target.value)}
// // // // // // //           className="flex-1 p-2 border border-gray-300 rounded-l"
// // // // // // //           placeholder="Type your message..."
// // // // // // //         />
// // // // // // //         <button onClick={sendMessage} className="bg-green-500 text-white px-4 rounded-r hover:bg-green-600">
// // // // // // //           Send
// // // // // // //         </button>
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }
// // // // // // 'use client';

// // // // // // import { useEffect, useState } from 'react';
// // // // // // import { onAuthStateChanged } from 'firebase/auth';
// // // // // // import { useRouter } from 'next/navigation';
// // // // // // import { auth } from '@/firebase/firebaseConfig';

// // // // // // export default function ChatPage() {
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const router = useRouter();

// // // // // //   useEffect(() => {
// // // // // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // // // // //       if (!user) {
// // // // // //         router.push('/login'); // 🔒 Redirect to login if not authenticated
// // // // // //       } else {
// // // // // //         setLoading(false); // ✅ Authenticated
// // // // // //       }
// // // // // //     });

// // // // // //     return () => unsubscribe();
// // // // // //   }, [router]);

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="h-screen flex justify-center items-center">
// // // // // //         <p className="text-xl font-semibold">Loading...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 via-green-100 to-green-300">
// // // // // //       <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl">
// // // // // //         <h1 className="text-3xl font-bold text-center text-green-700 mb-6">Welcome to NutriChef Chat</h1>
// // // // // //         {/* Chat UI goes here */}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // 'use client';

// // // // // import { useEffect, useState } from 'react';
// // // // // import { onAuthStateChanged } from 'firebase/auth';
// // // // // import { useRouter } from 'next/navigation';
// // // // // import { auth } from '@/firebase/firebaseConfig';

// // // // // export default function ChatPage() {
// // // // //   const router = useRouter();
// // // // //   const [user, setUser] = useState<any>(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [message, setMessage] = useState('');
// // // // //   const [chat, setChat] = useState<string[]>([]);

// // // // //   useEffect(() => {
// // // // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // // // //       if (!user) {
// // // // //         router.push('/login');
// // // // //       } else {
// // // // //         setUser(user);
// // // // //       }
// // // // //       setLoading(false);
// // // // //     });

// // // // //     return () => unsubscribe();
// // // // //   }, [router]);

// // // // //   const sendMessage = () => {
// // // // //     if (message.trim()) {
// // // // //       setChat([...chat, `You: ${message}`, `NutriChef: Here's a healthy recipe suggestion for "${message}"`]);
// // // // //       setMessage('');
// // // // //     }
// // // // //   };

// // // // //   if (loading) return <div className="text-center text-lg p-10">Loading...</div>;

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center px-4 py-6 font-sans">
// // // // //       <h1 className="text-3xl font-bold text-green-800 mb-6">🍲 NutriChef Chat</h1>

// // // // //       <div className="w-full max-w-3xl bg-white p-6 shadow-xl rounded-2xl flex-1 overflow-y-auto border border-green-200">
// // // // //         {chat.length === 0 ? (
// // // // //           <p className="text-gray-500 text-center italic">Start a conversation with NutriChef!</p>
// // // // //         ) : (
// // // // //           chat.map((msg, idx) => (
// // // // //             <div key={idx} className={`mb-3 ${msg.startsWith('You:') ? 'text-right text-green-800' : 'text-left text-gray-700'}`}>
// // // // //               {msg}
// // // // //             </div>
// // // // //           ))
// // // // //         )}
// // // // //       </div>

// // // // //       <div className="w-full max-w-3xl mt-4 flex">
// // // // //         <input
// // // // //           type="text"
// // // // //           value={message}
// // // // //           onChange={(e) => setMessage(e.target.value)}
// // // // //           className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-green-300"
// // // // //           placeholder="Type your message..."
// // // // //         />
// // // // //         <button
// // // // //           onClick={sendMessage}
// // // // //           className="bg-green-600 text-white px-6 rounded-r-xl hover:bg-green-700 transition font-semibold"
// // // // //         >
// // // // //           Send
// // // // //         </button>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // 'use client';

// // // // import { useEffect, useState } from 'react';
// // // // import { onAuthStateChanged } from 'firebase/auth';
// // // // import { useRouter } from 'next/navigation';
// // // // import { auth } from '@/firebase/firebaseConfig';

// // // // export default function ChatPage() {
// // // //   const router = useRouter();
// // // //   const [user, setUser] = useState<any>(null);
// // // //   const [loading, setLoading] = useState(true); // true by default until auth state is resolved
// // // //   const [message, setMessage] = useState('');
// // // //   const [chat, setChat] = useState<string[]>([]);

// // // //   useEffect(() => {
// // // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // // //       if (currentUser) {
// // // //         setUser(currentUser);
// // // //       } else {
// // // //         router.push('/login'); // redirect to login if not logged in
// // // //       }
// // // //       setLoading(false);
// // // //     });

// // // //     return () => unsubscribe();
// // // //   }, [router]);

// // // //   const sendMessage = () => {
// // // //     if (message.trim()) {
// // // //       setChat([
// // // //         ...chat,
// // // //         `You: ${message}`,
// // // //         `NutriChef: Here's a healthy recipe suggestion for "${message}"`,
// // // //       ]);
// // // //       setMessage('');
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
// // // //         Checking authentication...
// // // //       </div>
// // // //     );
// // // //   }

// // // //   if (!user) {
// // // //     return null; // Prevent flicker if not logged in
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center px-4 py-6 font-sans">
// // // //       <h1 className="text-3xl font-bold text-green-800 mb-6">🍲 NutriChef Chat</h1>

// // // //       <div className="w-full max-w-3xl bg-white p-6 shadow-xl rounded-2xl flex-1 overflow-y-auto border border-green-200">
// // // //         {chat.length === 0 ? (
// // // //           <p className="text-gray-500 text-center italic">Start a conversation with NutriChef!</p>
// // // //         ) : (
// // // //           chat.map((msg, idx) => (
// // // //             <div
// // // //               key={idx}
// // // //               className={`mb-3 ${
// // // //                 msg.startsWith('You:')
// // // //                   ? 'text-right text-green-800 font-medium'
// // // //                   : 'text-left text-gray-700'
// // // //               }`}
// // // //             >
// // // //               {msg}
// // // //             </div>
// // // //           ))
// // // //         )}
// // // //       </div>

// // // //       <div className="w-full max-w-3xl mt-4 flex">
// // // //         <input
// // // //           type="text"
// // // //           value={message}
// // // //           onChange={(e) => setMessage(e.target.value)}
// // // //           className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-green-300"
// // // //           placeholder="Type your message..."
// // // //         />
// // // //         <button
// // // //           onClick={sendMessage}
// // // //           className="bg-green-600 text-white px-6 rounded-r-xl hover:bg-green-700 transition font-semibold"
// // // //         >
// // // //           Send
// // // //         </button>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // 'use client';

// // // import { useEffect, useState } from 'react';
// // // import { onAuthStateChanged } from 'firebase/auth';
// // // import { useRouter } from 'next/navigation';
// // // import { auth } from '@/firebase/firebaseConfig';

// // // export default function ChatPage() {
// // //   const router = useRouter();
// // //   const [isAuthChecked, setIsAuthChecked] = useState(false);
// // //   const [user, setUser] = useState<any>(null);
// // //   const [message, setMessage] = useState('');
// // //   const [chat, setChat] = useState<string[]>([]);

// // //   useEffect(() => {
// // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // //       if (currentUser) {
// // //         setUser(currentUser);
// // //       } else {
// // //         router.replace('/login'); // redirect if not authenticated
// // //       }
// // //       setIsAuthChecked(true); // only show UI after auth is checked
// // //     });

// // //     return () => unsubscribe();
// // //   }, [router]);

// // //   if (!isAuthChecked) {
// // //     return (
// // //       <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
// // //         Checking authentication...
// // //       </div>
// // //     );
// // //   }

// // //   if (!user) return null; // prevent UI flash if user is not authenticated

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center px-4 py-6 font-sans">
// // //       <h1 className="text-3xl font-bold text-green-800 mb-6">🍲 NutriChef Chat</h1>

// // //       <div className="w-full max-w-3xl bg-white p-6 shadow-xl rounded-2xl flex-1 overflow-y-auto border border-green-200">
// // //         {chat.length === 0 ? (
// // //           <p className="text-gray-500 text-center italic">Start a conversation with NutriChef!</p>
// // //         ) : (
// // //           chat.map((msg, idx) => (
// // //             <div
// // //               key={idx}
// // //               className={`mb-3 ${
// // //                 msg.startsWith('You:')
// // //                   ? 'text-right text-green-800 font-medium'
// // //                   : 'text-left text-gray-700'
// // //               }`}
// // //             >
// // //               {msg}
// // //             </div>
// // //           ))
// // //         )}
// // //       </div>

// // //       <div className="w-full max-w-3xl mt-4 flex">
// // //         <input
// // //           type="text"
// // //           value={message}
// // //           onChange={(e) => setMessage(e.target.value)}
// // //           className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-green-300"
// // //           placeholder="Type your message..."
// // //         />
// // //         <button
// // //           onClick={() => {
// // //             if (message.trim()) {
// // //               setChat([
// // //                 ...chat,
// // //                 `You: ${message}`,
// // //                 `NutriChef: Here's a healthy recipe suggestion for "${message}"`,
// // //               ]);
// // //               setMessage('');
// // //             }
// // //           }}
// // //           className="bg-green-600 text-white px-6 rounded-r-xl hover:bg-green-700 transition font-semibold"
// // //         >
// // //           Send
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // 'use client';

// // // import { useEffect, useState } from 'react';
// // // import { useRouter } from 'next/navigation';
// // // import { onAuthStateChanged } from 'firebase/auth';
// // // import { auth } from '@/firebase/firebaseConfig';

// // // export default function ChatPage() {
// // //   const router = useRouter();
// // //   const [loading, setLoading] = useState(true);
// // //   const [user, setUser] = useState<any>(null);

// // //   useEffect(() => {
// // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // //       if (!currentUser) {
// // //         router.push('/login');
// // //       } else {
// // //         setUser(currentUser);
// // //         setLoading(false);
// // //       }
// // //     });
// // //     return () => unsubscribe();
// // //   }, []);

// // //   if (loading) return <p className="text-center mt-10">Loading...</p>;

// // //   return (
// // //     <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
// // //       <h1 className="text-2xl font-bold mb-4">Chat with NutriChef</h1>
// // //       <div className="border border-gray-300 rounded p-4 h-64 overflow-y-scroll bg-gray-50">
// // //         {/* Your chat messages will appear here */}
// // //         <p className="text-gray-500">Start chatting about food, health, and recipes...</p>
// // //       </div>
// // //       <div className="mt-4 flex">
// // //         <input
// // //           type="text"
// // //           placeholder="Type your message..."
// // //           className="flex-1 border border-gray-300 p-2 rounded-l focus:outline-none"
// // //         />
// // //         <button className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600">
// // //           Send
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // 'use client';

// // // import { useEffect, useState } from 'react';
// // // import { useRouter } from 'next/navigation';
// // // import { onAuthStateChanged, signOut } from 'firebase/auth';
// // // import { auth } from '@/firebase/firebaseConfig';

// // // export default function ChatPage() {
// // //   const router = useRouter();
// // //   const [loading, setLoading] = useState(true);
// // //   const [user, setUser] = useState<any>(null);

// // //   useEffect(() => {
// // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // //       if (!currentUser) {
// // //         router.push('/login');
// // //       } else {
// // //         setUser(currentUser);
// // //         setLoading(false);
// // //       }
// // //     });
// // //     return () => unsubscribe();
// // //   }, []);

// // //   const handleLogout = async () => {
// // //     await signOut(auth);
// // //     router.push('/login');
// // //   };

// // //   if (loading) return <p className="text-center mt-10">Loading...</p>;

// // //   return (
// // //     <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg relative">
// // //       {/* Logout Button */}
// // //       <button
// // //         onClick={handleLogout}
// // //         className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
// // //       >
// // //         Logout
// // //       </button>

// // //       <h1 className="text-2xl font-bold mb-4">Chat with NutriChef</h1>

// // //       <div className="border border-gray-300 rounded p-4 h-64 overflow-y-scroll bg-gray-50">
// // //         {/* Chat messages will appear here */}
// // //         <p className="text-gray-500">Start chatting about food, health, and recipes...</p>
// // //       </div>

// // //       <div className="mt-4 flex">
// // //         <input
// // //           type="text"
// // //           placeholder="Type your message..."
// // //           className="flex-1 border border-gray-300 p-2 rounded-l focus:outline-none"
// // //         />
// // //         <button className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600">
// // //           Send
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { onAuthStateChanged, signOut } from 'firebase/auth';
// // import { auth } from '@/firebase/firebaseConfig';

// // export default function ChatPage() {
// //   const router = useRouter();
// //   const [loading, setLoading] = useState(true);
// //   const [user, setUser] = useState<any>(null);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //       if (!currentUser) {
// //         router.push('/login');
// //       } else {
// //         setUser(currentUser);
// //         setLoading(false);
// //       }
// //     });
// //     return () => unsubscribe();
// //   }, []);

// //   useEffect(() => {
// //     // Inject Bolt.new chat widget
// //     const script = document.createElement('script');
// //     script.src = 'https://bolt.new/chat.js';
// //     script.async = true;
// //     script.setAttribute('data-bolt-chatbot-id', 'YOUR_BOLT_SCRIPT_ID'); // Replace this
// //     document.body.appendChild(script);

// //     return () => {
// //       document.body.removeChild(script); // Clean up
// //     };
// //   }, []);

// //   const handleLogout = async () => {
// //     await signOut(auth);
// //     router.push('/login');
// //   };

// //   if (loading) return <p className="text-center mt-10">Loading...</p>;

// //   return (
// //     <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg relative min-h-screen">
// //       {/* Logout Button */}
// //       <button
// //         onClick={handleLogout}
// //         className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
// //       >
// //         Logout
// //       </button>

// //       <h1 className="text-2xl font-bold mb-4">Chat with NutriChef</h1>

// //       <div className="border border-gray-300 rounded p-4 h-64 overflow-y-scroll bg-gray-50">
// //         {/* Chat messages will appear here */}
// //         <p className="text-gray-500">Start chatting about food, health, and recipes...</p>
// //       </div>

// //       <div className="mt-4 flex">
// //         <input
// //           type="text"
// //           placeholder="Type your message..."
// //           className="flex-1 border border-gray-300 p-2 rounded-l focus:outline-none"
// //         />
// //         <button className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600">
// //           Send
// //         </button>
// //       </div>

// //       {/* Bolt.new widget will load separately */}
// //     </div>
// //   );
// // }
// // 'use client';

// // import { useEffect, useRef, useState } from 'react';
// // import { onAuthStateChanged, signOut } from 'firebase/auth';
// // import { auth } from '@/firebase/firebaseConfig';
// // import { useRouter } from 'next/navigation';
// // import { ArrowUpCircle, LogOut, UserCircle } from 'lucide-react';

// // export default function ChatPage() {
// //   const [messages, setMessages] = useState([
// //     { from: 'bot', text: 'Hello! How can I assist you today?' }
// //   ]);
// //   const [input, setInput] = useState('');
// //   const [userEmail, setUserEmail] = useState('');
// //   const messagesEndRef = useRef(null);
// //   const router = useRouter();

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// //       if (!user) {
// //         router.push('/login');
// //       } else {
// //         setUserEmail(user.email || '');
// //       }
// //     });
// //     return () => unsubscribe();
// //   }, []);

// //   const handleSend = () => {
// //     if (!input.trim()) return;
// //     setMessages([...messages, { from: 'user', text: input }, { from: 'bot', text: 'Thinking...' }]);
// //     setInput('');
// //     setTimeout(() => {
// //       setMessages(prev => {
// //         const newMessages = [...prev];
// //         newMessages.pop(); // remove 'Thinking...'
// //         newMessages.push({ from: 'bot', text: `You said: "${input}"` });
// //         return newMessages;
// //       });
// //     }, 1000);
// //   };

// //   const handleLogout = async () => {
// //     await signOut(auth);
// //     router.push('/login');
// //   };

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   return (
// //     <div className="h-screen flex flex-col bg-gradient-to-b from-zinc-900 to-black text-white font-sans">
// //       {/* Navbar */}
// //       <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 shadow-md border-b border-zinc-800">
// //         <h1 className="text-xl font-bold tracking-tight text-green-400">Techify Chat</h1>
// //         <div className="flex items-center gap-4">
// //           <span className="text-sm text-zinc-300 flex items-center gap-2">
// //             <UserCircle className="w-5 h-5" /> {userEmail}
// //           </span>
// //           <button
// //             onClick={handleLogout}
// //             className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition text-sm"
// //           >
// //             <LogOut className="w-4 h-4 inline mr-1" /> Logout
// //           </button>
// //         </div>
// //       </div>

// //       {/* Chat Body */}
// //       <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
// //         {messages.map((msg, idx) => (
// //           <div
// //             key={idx}
// //             className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
// //           >
// //             <div
// //               className={`max-w-lg px-4 py-2 rounded-xl shadow-sm ${
// //                 msg.from === 'user'
// //                   ? 'bg-green-600 text-white'
// //                   : 'bg-zinc-800 text-zinc-100'
// //               }`}
// //             >
// //               {msg.text}
// //             </div>
// //           </div>
// //         ))}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* Input */}
// //       <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-3">
// //         <input
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
// //           placeholder="Type your message..."
// //           className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-600"
// //         />
// //         <button onClick={handleSend} className="text-green-500 hover:text-green-400 transition">
// //           <ArrowUpCircle className="w-8 h-8" />
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { auth } from '@/firebase/firebaseConfig';
// import { useRouter } from 'next/navigation';
// import { ArrowUpCircle, LogOut, UserCircle } from 'lucide-react';

// export default function ChatPage() {
//   const [messages, setMessages] = useState([
//     { from: 'bot', text: 'Hello! How can I assist you today?' }
//   ]);
//   const [input, setInput] = useState('');
//   const [userEmail, setUserEmail] = useState('');
//   const messagesEndRef = useRef(null);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         router.push('/login');
//       } else {
//         setUserEmail(user.email || '');
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleSend = () => {
//     if (!input.trim()) return;
//     setMessages([
//       ...messages,
//       { from: 'user', text: input },
//       { from: 'bot', text: 'Thinking...' }
//     ]);
//     const userMessage = input;
//     setInput('');
//     setTimeout(() => {
//       setMessages(prev => {
//         const newMessages = [...prev];
//         newMessages.pop(); // remove 'Thinking...'
//         newMessages.push({ from: 'bot', text: `You said: "${userMessage}"` });
//         return newMessages;
//       });
//     }, 1000);
//   };

//   const handleLogout = async () => {
//     await signOut(auth);
//     router.push('/login');
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div className="h-screen flex flex-col bg-gradient-to-b from-[#0f0f0f] to-[#1c1c1c] text-white font-sans">
//       {/* Navbar */}
//       <div className="flex items-center justify-between px-6 py-4 bg-[#111111] shadow-md border-b border-[#2a2a2a]">
//         <h1 className="text-xl font-bold tracking-tight text-green-400">NutriChef Chat</h1>
//         <div className="flex items-center gap-4">
//           <span className="text-sm text-gray-300 flex items-center gap-2">
//             <UserCircle className="w-5 h-5" /> {userEmail}
//           </span>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition text-sm"
//           >
//             <LogOut className="w-4 h-4 inline mr-1" /> Logout
//           </button>
//         </div>
//       </div>

//       {/* Chat Body */}
//       <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-lg px-4 py-2 rounded-xl shadow-sm ${
//                 msg.from === 'user'
//                   ? 'bg-green-600 text-white rounded-br-none'
//                   : 'bg-[#2a2a2a] text-gray-100 rounded-bl-none'
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div className="px-6 py-4 border-t border-[#2a2a2a] bg-[#111111] flex items-center gap-3">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type your message..."
//           className="flex-1 bg-[#1f1f1f] text-white px-4 py-2 rounded-xl border border-[#333] focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <button onClick={handleSend} className="text-green-500 hover:text-green-400 transition">
//           <ArrowUpCircle className="w-8 h-8" />
//         </button>
//       </div>
//     </div>
//   );
// }
'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { ArrowUpCircle, LogOut, UserCircle } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { from: 'user', text: input },
      { from: 'bot', text: 'Thinking...' }
    ]);
    const userMessage = input;
    setInput('');
    setTimeout(() => {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // remove 'Thinking...'
        newMessages.push({ from: 'bot', text: `You said: "${userMessage}"` });
        return newMessages;
      });
    }, 1000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#e6ffe6] to-white text-gray-800 font-sans">
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#ccf5cc] shadow-md border-b border-green-300">
        <h1 className="text-xl font-bold tracking-tight text-green-700">NutriChef Chat</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 flex items-center gap-2">
            <UserCircle className="w-5 h-5" /> {userEmail}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition text-sm text-white"
          >
            <LogOut className="w-4 h-4 inline mr-1" /> Logout
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg px-4 py-2 rounded-xl shadow-sm ${
                msg.from === 'user'
                  ? 'bg-green-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-green-200 bg-[#f0fff0] flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-white text-gray-800 px-4 py-2 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button onClick={handleSend} className="text-green-600 hover:text-green-500 transition">
          <ArrowUpCircle className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
