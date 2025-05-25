 
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { auth } from '@/firebase/firebaseConfig';  // Ensure this path is correct
// import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// export default function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       router.push('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
//       <div className="text-2xl font-extrabold tracking-wide">
//         <Link href="/">NutriChef</Link>
//       </div>

//       <div className="flex space-x-6 text-lg">
//         <Link
//           href="/"
//           className={`hover:underline ${pathname === '/' ? 'underline font-semibold' : ''}`}
//         >
//           Home
//         </Link>
//         <Link
//           href="/chat"
//           className={`hover:underline ${pathname === '/chat' ? 'underline font-semibold' : ''}`}
//         >
//           Chat
//         </Link>
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// }
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const hideNavbar = pathname === "/chat";
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (hideNavbar) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="flex items-center space-x-2">
        <Image
          src="https://img.icons8.com/fluency/48/chef-hat.png"
          alt="Chef Icon"
          width={36}
          height={36}
          priority
        />
        <h1 className={`text-2xl font-bold ${scrolled ? 'text-green-600' : 'text-white'}`}>NutriChef</h1>
      </div>
      <div className="flex space-x-3">
        <Link href="/">
          <button className={`px-4 py-2 text-sm rounded-lg transition ${
            scrolled 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
          }`}>Home</button>
        </Link>
        <Link href="/chat">
          <button className={`px-4 py-2 text-sm rounded-lg transition ${
            scrolled 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
          }`}>Chat</button>
        </Link>
        
        {!user ? (
          <Link href="/login">
            <button className={`px-4 py-2 text-sm rounded-lg transition ${
              scrolled 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}>Login</button>
          </Link>
        ) : (
          <button 
            onClick={handleLogout}
            className={`px-4 py-2 text-sm rounded-lg transition ${
              scrolled 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-red-500/70 backdrop-blur-sm text-white hover:bg-red-500/90'
            }`}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
