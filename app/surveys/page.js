// app/surveys/page.js
'use client';

import React, { useState } from 'react';
import { auth, db, storage } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AuthCheck from '../components/AuthCheck';

const SurveyPage = () => {
  const [question1, setQuestion1] = useState('');
  const [audioRecording, setAudioRecording] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleAudioChange = (e) => {
    if (e.target.files[0]) {
      setAudioRecording(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!audioRecording) {
      setError('Please select an audio file.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated.');
        return;
      }

      const storageRef = ref(storage, `audio/${user.uid}/${audioRecording.name}`);
      const snapshot = await uploadBytes(storageRef, audioRecording);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'surveys'), {
        question1: question1,
        audioURL: downloadURL,
        userId: user.uid,
        timestamp: new Date(),
      });

      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Survey Page</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="question1">Question 1: What is your favourite colour?</label>
          <input
            type="text"
            id="question1"
            value={question1}
            onChange={(e) => setQuestion1(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="audio">Audio Recording:</label>
          <input type="file" id="audio" accept="audio/*" onChange={handleAudioChange} />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit Survey
        </button>
      </form>
    </div>
  );
};

const Surveys = () => {
  return (
    <AuthCheck>
      <SurveyPage />
    </AuthCheck>
  );
};

export default Surveys;