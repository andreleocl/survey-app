'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from './utils/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Modal from 'react-modal';
import RecordRTC from 'recordrtc';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const HomePage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ question1: 'What is your favourite colour?', answer1: '', question2: 'What is your favourite fruit?', answer2: '' });
  const [recorder, setRecorder] = useState(null);
  const [recordingFieldName, setRecordingFieldName] = useState(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      Modal.setAppElement(document.getElementById('__next')); 
    }
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          const querySnapshot = await getDocs(collection(db, 'surveys'));
          const surveysData = querySnapshot.docs
            .filter((doc) => doc.data().userId === user.uid)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setSurveys(surveysData);
        } catch (error) {
          console.error('Error fetching surveys:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSurveys([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const startEditing = (survey) => {
    setEditingSurvey({ ...survey });
    setNewSurvey({
      answer1: survey.answerUrl1 || '',
      answer2: survey.answerUrl2 || '',
    });
    setIsModalOpen(true);
  };
  
  const deleteSurvey = async (id, answerUrl1, answerUrl2) => {
    try {
      const surveyDoc = doc(db, 'surveys', id);
      await deleteDoc(surveyDoc);

      if (answerUrl1) {
        const answer1Ref = ref(storage, answerUrl1);
        await deleteObject(answer1Ref);
      }
      if (answerUrl2) {
        const answer2Ref = ref(storage, answerUrl2);
        await deleteObject(answer2Ref);
      }

      setSurveys(surveys.filter((survey) => survey.id !== id));
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setNewSurvey({ question1: '', answer1: '', question2: '', answer2: '' });
    setEditingSurvey(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSurvey(null);
  };

  const submitNewSurvey = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      try {
        let answer1Url = newSurvey.answer1;
        let answer2Url = newSurvey.answer2;

        if (typeof newSurvey.answer1 !== 'string') {
          const answer1Ref = ref(storage, `audio/${user.uid}/${Date.now()}-answer1.webm`);
          const answer1Snapshot = await uploadBytes(answer1Ref, newSurvey.answer1);
          answer1Url = await getDownloadURL(answer1Snapshot.ref);
        }

        if (typeof newSurvey.answer2 !== 'string') {
          const answer2Ref = ref(storage, `audio/${user.uid}/${Date.now()}-answer2.webm`);
          const answer2Snapshot = await uploadBytes(answer2Ref, newSurvey.answer2);
          answer2Url = await getDownloadURL(answer2Snapshot.ref);
        }

        if (editingSurvey) {
          await updateDoc(doc(db, 'surveys', editingSurvey.id), {
            answerUrl1: answer1Url,
            answerUrl2: answer2Url,
          });
        } else {
          await addDoc(collection(db, 'surveys'), {
            question1: 'What is your favourite colour?',
            question2: 'What is your favourite fruit?',
            answerUrl1: answer1Url,
            answerUrl2: answer2Url,
            userId: user.uid,
          });
        }

        closeModal();
        window.location.reload();
      } catch (error) {
        console.error('Error submitting survey: ', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  const handleSpeechInput = async (fieldName) => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      if (recorder && recordingFieldName === fieldName) {
        recorder.stopRecording(async () => {
          const blob = recorder.getBlob();
          setNewSurvey({ ...newSurvey, [fieldName]: blob });
          setRecorder(null);
          setRecordingFieldName(null);
        });
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const rec = RecordRTC(stream, { type: 'audio' });
          rec.startRecording();
          setRecorder(rec);
          setRecordingFieldName(fieldName);
        });
      }
    } else {
      console.error('navigator.mediaDevices is not available in this environment.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>Completed Surveys</h2>
        <button
          onClick={openModal}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
        >
          Add new entry
        </button>
      </div>
      {/* Table of surveys */}
      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <thead>
        <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
          <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333', width: '40%' }}>What is your favourite colour?</th>
          <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333', width: '40%' }}>What is your favourite fruit?</th>
          <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#333', width: '20%' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {surveys.map((survey) => (
          <tr key={survey.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={{ padding: '12px', textAlign: 'left', color: '#444', width: '40%' }}>
              {survey.answerUrl1 && <audio controls src={survey.answerUrl1} style={{ marginTop: '5px', width: '100%' }} />}
            </td>
            <td style={{ padding: '12px', textAlign: 'left', color: '#444', width: '40%' }}>
              {survey.answerUrl2 && <audio controls src={survey.answerUrl2} style={{ marginTop: '5px', width: '100%' }} />}
            </td>
            <td style={{ padding: '12px', textAlign: 'center', width: '20%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  onClick={() => startEditing(survey)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSurvey(survey.id, survey.answerUrl1, survey.answerUrl2)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#c82333')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#dc3545')}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Modal for new entry*/}
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      contentLabel="New Survey Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        content: {
          width: '350px',
          maxWidth: '90%',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          border: 'none',
          backgroundColor: '#ffffff',
          position: 'relative',
        },
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>What is your favourite colour?</p>
        {newSurvey.answer1 && (
            <audio controls src={typeof newSurvey.answer1 === 'string' ? newSurvey.answer1 : URL.createObjectURL(newSurvey.answer1)} style={{ marginTop: '10px' }} />
        )}
        <button
          onClick={() => handleSpeechInput('answer1')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 15px',
            marginTop: '2%',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30%'
          }}
        >
          {recorder && recordingFieldName === 'answer1' ? (
            <>
              <FaStop style={{ marginRight: '8px' }} /> Stop
            </>
          ) : (
            <>
              <FaMicrophone style={{ marginRight: '8px' }} /> Speak
            </>
          )}
        </button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>What is your favourite fruit?</p>
        {newSurvey.answer2 && (
            <audio controls src={typeof newSurvey.answer2 === 'string' ? newSurvey.answer2 : URL.createObjectURL(newSurvey.answer2)} style={{ marginTop: '10px' }} />
        )}
        <button
          onClick={() => handleSpeechInput('answer2')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 15px',
            marginTop: '2%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30%',
          }}
        >
          {recorder && recordingFieldName === 'answer2' ? (
            <>
              <FaStop style={{ marginRight: '8px' }} /> Stop
            </>
          ) : (
            <>
              <FaMicrophone style={{ marginRight: '8px' }} /> Speak
            </>
          )}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={submitNewSurvey}
          style={{
            padding: '12px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {editingSurvey ? 'Update' : 'Submit'}
        </button>
        <button
          onClick={closeModal}
          style={{
            padding: '12px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
    {/* About Me */}
    <div style={{ marginTop: '5%' }}>
      <h3 style={{ color: '#333', marginBottom: '10px' }}>About Me</h3>
      <p style={{ lineHeight: '1.6', color: '#555' }}>
        I'm a second-year Computer Science student at SMU. Beyond the realm of algorithms and code, I harbor a deep and rather unique passion for the intricate art of perfumery. Exploring the nuanced world of fragrances is a constant source of fascination for me, where each scent tells a story. On the technical side, I'm proficient in a range of programming languages, including Java, Python, and C, and I've recently been diving into the front-end development possibilities of Next.js. I'm always eager to learn and apply my skills to create meaningful and innovative projects, whether it's crafting elegant code or deciphering the complexities of a new fragrance.
      </p>
    </div>
  </div>
  );
};

export default HomePage;