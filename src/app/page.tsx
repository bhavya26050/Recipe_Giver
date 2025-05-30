// // import Image from "next/image";

// // export default function Home() {
// //   return (
// //     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
// //       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
// //         <Image
// //           className="dark:invert"
// //           src="/next.svg"
// //           alt="Next.js logo"
// //           width={180}
// //           height={38}
// //           priority
// //         />
// //         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
// //           <li className="mb-2 tracking-[-.01em]">
// //             Get started by editing{" "}
// //             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
// //               src/app/page.tsx
// //             </code>
// //             .
// //           </li>
// //           <li className="tracking-[-.01em]">
// //             Save and see your changes instantly.
// //           </li>
// //         </ol>

// //         <div className="flex gap-4 items-center flex-col sm:flex-row">
// //           <a
// //             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
// //             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //           >
// //             <Image
// //               className="dark:invert"
// //               src="/vercel.svg"
// //               alt="Vercel logomark"
// //               width={20}
// //               height={20}
// //             />
// //             Deploy now
// //           </a>
// //           <a
// //             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
// //             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //           >
// //             Read our docs
// //           </a>
// //         </div>
// //       </main>
// //       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
// //         <a
// //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
// //           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           <Image
// //             aria-hidden
// //             src="/file.svg"
// //             alt="File icon"
// //             width={16}
// //             height={16}
// //           />
// //           Learn
// //         </a>
// //         <a
// //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
// //           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           <Image
// //             aria-hidden
// //             src="/window.svg"
// //             alt="Window icon"
// //             width={16}
// //             height={16}
// //           />
// //           Examples
// //         </a>
// //         <a
// //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
// //           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           <Image
// //             aria-hidden
// //             src="/globe.svg"
// //             alt="Globe icon"
// //             width={16}
// //             height={16}
// //           />
// //           Go to nextjs.org →
// //         </a>
// //       </footer>
// //     </div>
// //   );
// // }
// import Link from 'next/link';

// export default function HomePage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 via-green-200 to-green-300">
//       <div className="text-center p-8 bg-white rounded shadow-lg max-w-xl">
//         <h1 className="text-4xl font-bold text-green-700 mb-4">Welcome to NutriChef 🥗</h1>
//         <p className="text-gray-700 mb-6">Your smart food and diet recipe assistant using AI</p>
//         <div className="space-x-4">
//           <Link href="/login">
//             <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Login</button>
//           </Link>
//           <Link href="/register">
//             <button className="border border-green-500 text-green-600 px-4 py-2 rounded hover:bg-green-100 transition">Register</button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useRouter } from 'next/navigation';
// import { onAuthStateChanged } from 'firebase/auth';
// import { useEffect } from 'react';
// import { auth } from '@/firebase/firebaseConfig';

// export default function LandingPage() {
//   const router = useRouter();

//   useEffect(() => {
//     // Auto-redirect if already logged in
//     onAuthStateChanged(auth, (user) => {
//       if (user) router.replace('/chat');
//     });
//   }, [router]);

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-white to-green-100 flex flex-col items-center justify-center px-6 py-12">
//       <h1 className="text-5xl font-extrabold text-green-700 mb-4">🌿 NutriChef</h1>
//       <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
//         Your personalized nutrition and recipe assistant. Start chatting to get healthy meal plans based on your preferences.
//       </p>
//       <div className="flex gap-6">
//         <button
//           onClick={() => router.push('/login')}
//           className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
//         >
//           Login
//         </button>
//         <button
//           onClick={() => router.push('/register')}
//           className="px-6 py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg shadow-md hover:bg-green-100 transition"
//         >
//           Register
//         </button>
//       </div>
//     </main>
//   );
// }
'use client';

import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '@/firebase/firebaseConfig';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already logged in
    onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/chat');
    });
  }, [router]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-xl max-w-3xl w-full p-12 flex flex-col items-center text-center">
        <h1 className="text-6xl font-extrabold text-emerald-700 mb-6 flex items-center justify-center gap-3">
          <span>🌿</span> NutriChef <span>🍲</span>
        </h1>

        <p className="text-xl text-gray-700 mb-10 max-w-xl leading-relaxed">
          Your personalized <span className="font-semibold text-emerald-600">nutrition and recipe assistant</span>. 
          Just tell me what ingredients you have or the name of the dish, and I'll provide you with delicious meal plans and recipes!
        </p>

        <div className="flex gap-8">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition transform hover:-translate-y-1"
            aria-label="Login"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-700 rounded-2xl shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-1"
            aria-label="Register"
          >
            Register
          </button>
        </div>

        <div className="mt-12 flex items-center gap-4 text-gray-600 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16v-1a4 4 0 00-3-3.87M3 16v-1a4 4 0 013-3.87M12 20c4.418 0 8-3.582 8-8 0-1.336-.408-2.577-1.102-3.616M4 12c0 4.418 3.582 8 8 8z" />
          </svg>
          <p>
            Chat with NutriChef and get personalized recipes based on your ingredients or dish names.
          </p>
        </div>
      </div>
    </main>
  );
}
