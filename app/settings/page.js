'use client';

import React, { useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const SettingsPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (!newPassword.trim()) {
      setError('Please enter a password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await updatePassword(user, newPassword);
        setSuccess('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError('User not logged in.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Change Password</h2>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={handleChangePassword}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
      >
        Change Password
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>{success}</p>}

      <button
        onClick={() => router.back()}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#e0e0e0')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
      >
        Back
      </button>
    </div>
  );
};

export default SettingsPage;