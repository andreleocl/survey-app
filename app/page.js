'use client';

import React, { useState, useEffect } from 'react';
import { db } from './utils/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const HomePage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSurvey, setEditingSurvey] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      const surveysData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSurveys(surveysData);
      setLoading(false);
    };

    fetchSurveys();
  }, []);

  const startEditing = (survey) => {
    setEditingSurvey({ ...survey });
  };

  const cancelEditing = () => {
    setEditingSurvey(null);
  };

  const saveEditedSurvey = async () => {
    const surveyDoc = doc(db, 'surveys', editingSurvey.id);
    await updateDoc(surveyDoc, {
      question1: editingSurvey.question1,
      question2: editingSurvey.question2,
    });
    setEditingSurvey(null);
    window.location.reload();
  };

  const deleteSurvey = async (id) => {
    const surveyDoc = doc(db, 'surveys', id);
    await deleteDoc(surveyDoc);
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      {/* About Me */}
      <div>
        <h3>About Me</h3>
        <p>
          I am a year 2 Computer Science student from SMU. Outside of academics, I have a unique fascination with fragrances and enjoy exploring the world of scents. My skillsets include Java, Python, C, and Next.js
        </p>
      </div>

      <h2>Completed Surveys</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Question 1</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Question 2</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr key={survey.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingSurvey?.id === survey.id ? (
                  <input
                    type="text"
                    value={editingSurvey.question1}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, question1: e.target.value })}
                  />
                ) : (
                  <>
                    {survey.question1}
                    {survey.voiceUrl1 && <audio controls src={survey.voiceUrl1} />}
                  </>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingSurvey?.id === survey.id ? (
                  <input
                    type="text"
                    value={editingSurvey.question2}
                    onChange={(e) => setEditingSurvey({ ...editingSurvey, question2: e.target.value })}
                  />
                ) : (
                  <>
                    {survey.question2}
                    {survey.voiceUrl2 && <audio controls src={survey.voiceUrl2} />}
                  </>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingSurvey?.id === survey.id ? (
                  <>
                    <button onClick={saveEditedSurvey}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(survey)}>Edit</button>
                    <button onClick={() => deleteSurvey(survey.id)}>Delete</button>
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

export default HomePage;