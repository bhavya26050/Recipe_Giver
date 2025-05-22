// // components/Navbar.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { auth } from '@/firebase/firebaseConfig';
// import { onAuthStateChanged, signOut } from 'firebase/auth';

// export default function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//     router.push('/login');
//   };

//   return (
//     <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
//       <div className="text-xl font-bold">
//         <Link href="/">NutriChef</Link>
//       </div>
//       <div className="flex space-x-4">
//         <Link href="/" className={pathname === '/' ? 'underline' : ''}>Home</Link>
//         <Link href="/chat" className={pathname === '/chat' ? 'underline' : ''}>Chat</Link>
//         {!user ? (
//           <>
//             <Link href="/login" className={pathname === '/login' ? 'underline' : ''}>Login</Link>
//             <Link href="/register" className={pathname === '/register' ? 'underline' : ''}>Register</Link>
//           </>
//         ) : (
//           <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
//         )}
//       </div>
//     </nav>
//   );
// }
// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';  // Ensure this path is correct
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
      <div className="text-2xl font-extrabold tracking-wide">
        <Link href="/">NutriChef</Link>
      </div>

      <div className="flex space-x-6 text-lg">
        <Link
          href="/"
          className={`hover:underline ${pathname === '/' ? 'underline font-semibold' : ''}`}
        >
          Home
        </Link>
        <Link
          href="/chat"
          className={`hover:underline ${pathname === '/chat' ? 'underline font-semibold' : ''}`}
        >
          Chat
        </Link>

        {!user ? (
          <>
            <Link
              href="/login"
              className={`hover:underline ${pathname === '/login' ? 'underline font-semibold' : ''}`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`hover:underline ${pathname === '/register' ? 'underline font-semibold' : ''}`}
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="hover:text-red-400 font-semibold transition-colors duration-200"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
