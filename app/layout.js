// app/layout.js
'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { db } from './utils/firebase';
import { auth } from './utils/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().isAdmin || false);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
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
            <a href="/">Home</a> | 
              {isAdmin && <><a href="/dashboard"> Dashboard</a> | </>}
              <a href="/settings"> Settings</a> | <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
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