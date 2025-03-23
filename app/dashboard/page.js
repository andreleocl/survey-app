'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AuthCheck from '../components/AuthCheck';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    };

    checkAdmin();
    fetchUsers();
  }, [router]);

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = async (userId, updatedUser) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updatedUser);
      setEditingUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      if (window.confirm('Are you sure you want to delete this user?')) {
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>Admin Dashboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Username</th>
            <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#333' }}>isAdmin</th>
            <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px', textAlign: 'left', color: '#444' }}>
                {user.username}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#444' }}>
                {editingUser && editingUser.id === user.id ? (
                  <select value={editingUser.isAdmin} onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.value === 'true' })}>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                ) : (
                  user.isAdmin ? 'Yes' : 'No'
                )}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <button onClick={() => handleSave(user.id, editingUser)} style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px' }}>Save</button>
                    <button onClick={() => setEditingUser(null)} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(user)} style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(user.id)} style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Delete</button>
                  </>
                )}
              </td>
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