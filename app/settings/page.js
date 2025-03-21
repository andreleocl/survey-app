'use client';

import React, { useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Import useRouter

const SettingsPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter(); // Initialize router

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

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
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Settings</h2>

      <div>
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div>
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button onClick={handleChangePassword}>Change Password</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button onClick={() => router.back()}>Back</button> {/* Back button */}
    </div>
  );
};

export default SettingsPage;