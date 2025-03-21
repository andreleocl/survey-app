// app/components/AuthCheck.js
'use client';

import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/navigation';

const AuthCheck = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
        router.push('/login'); // Redirect to login if not authenticated.
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount.
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return null; // AuthCheck already redirects, nothing to render.
  }

  return <>{children}</>; // Render the protected content.
};

export default AuthCheck;