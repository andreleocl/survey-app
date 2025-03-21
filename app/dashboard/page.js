// app/admin/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import AuthCheck from '../components/AuthCheck';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = (await getDocs(collection(db, 'users'))).docs.find((doc) => doc.id === user.uid);
        if (userDoc && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          router.push('/'); // redirect non admins
        }
      } else {
        router.push('/login') // redirect unauthenticated users.
      }
    };

    checkAdmin();
    fetchUsers();

  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <h3>User List</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>isAdmin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.isAdmin ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminPage = () => {
  return (
    <AuthCheck>
      <AdminDashboard />
    </AuthCheck>
  );
};

export default AdminPage;