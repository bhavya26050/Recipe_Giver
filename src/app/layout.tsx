import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'NutriChef Chatbot',
  description: 'Smart diet and recipe assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <main className="">{children}</main>
      </body>
    </html>
  );
}
