// app/layout.js
'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { auth } from './utils/firebase';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <html lang="en">
      <body>
        <nav style={{ position: 'absolute', top: '10px', right: '10px' }}>
          {user ? (
            <>
              <a href="/settings">Settings</a> | <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <a href="/login">Login</a> | <a href="/register">Register</a>
            </>
          )}
        </nav>
        <main>{children}</main>
        <footer>
          {/* Footer content */}
        </footer>
      </body>
    </html>
  );
}