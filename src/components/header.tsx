// components/Header.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const path = router.pathname;

  let title = 'NutriChef';
  let subtitle = 'Your smart recipe assistant';

  if (path === '/login') {
    title = 'Login to NutriChef';
  } else if (path === '/register') {
    title = 'Create your account';
  } else if (path === '/chat') {
    title = 'Start Chatting with NutriChef';
  }

  return (
    <header className="bg-green-600 text-white p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm opacity-75">{subtitle}</p>
      </div>
      <nav>
        <Link href="/" className={`mr-4 ${path === '/' ? 'underline' : ''}`}>Home</Link>
        <Link href="/chat" className={`mr-4 ${path === '/chat' ? 'underline' : ''}`}>Chat</Link>
        {!['/login', '/register'].includes(path) && (
          <Link href="/login" className="mr-4">Login</Link>
        )}
        {(path === '/login' || path === '/register') && (
          <Link href="/register">Register</Link>
        )}
      </nav>
    </header>
  );
}
